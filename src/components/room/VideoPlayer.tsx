import { useRef, useEffect, useCallback, useState } from 'react';
import ReactPlayer from 'react-player';
import { VideoPlayerControls } from './VideoPlayerControls';
import { useFullscreen } from '../../hooks/use-fullscreen';
import { ProgressBar } from './ProgressBar';
import { Loader } from '../ui/loader';
import { debounce } from 'lodash';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/database/Rxdb';
import { Room, WSMessage } from '@/types/room';

interface VideoPlayerProps {
  url: string;
  roomId: string;
  sendMessage: (msg: WSMessage) => void;
  isController?: boolean;
  allowControl?: boolean;
}

export function VideoPlayer({ 
  url,
  roomId,
  sendMessage,
  isController = false,
  allowControl = true 
}: VideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<ReactPlayer>(null);
  const [muted, setMuted] = useState(true);
  const [volume, setVolume] = useState(1);
  const [seeking, setSeeking] = useState(false);
  const [loading, setLoading] = useState(true);
  const { isFullscreen, toggleFullscreen } = useFullscreen(containerRef);

  // Get room state from IndexedDB
  const room = useLiveQuery(() => db.rooms.get(roomId));

  // Sync player with room state
  useEffect(() => {
    if (room && playerRef.current) {
      playerRef.current.seekTo(room.currentTime, 'seconds');
      if (room.isPlaying !== playerRef.current.props.playing) {
        room.isPlaying ? playerRef.current.getInternalPlayer().play() 
                      : playerRef.current.getInternalPlayer().pause();
      }
    }
  }, [room]);

  // Debounced state update
  const updateRoomState = useCallback(
    debounce((state: Partial<Room>) => {
      if (!allowControl && !isController) return;
      
      db.rooms.update(roomId, {
        ...state,
        lastUpdated: Date.now()
      });
      
      sendMessage({
        type: 'STATE',
        roomId,
        state
      });
    }, 500),
    [roomId, sendMessage, allowControl, isController]
  );

  const handlePlayPause = () => {
    const newState = { isPlaying: !room?.isPlaying };
    updateRoomState(newState);
  };

  const handleSeek = (seconds: number) => {
    const player = playerRef.current;
    if (player) {
      const currentTime = player.getCurrentTime() + seconds;
      updateRoomState({ currentTime });
    }
  };

  const handleProgress = (state: { played: number; playedSeconds: number }) => {
    if (!seeking && (isController || allowControl)) {
      updateRoomState({ 
        currentTime: state.playedSeconds,
        isPlaying: room?.isPlaying ?? false
      });
    }
  };

  const handleSeekTo = (value: number) => {
    const player = playerRef.current;
    if (player) {
      const currentTime = value * player.getDuration();
      updateRoomState({ currentTime });
    }
  };

  const handlePlaybackRateChange = (rate: number) => {
    updateRoomState({ playbackRate: rate });
  };

  const handleReady = () => {
    setLoading(false);
    if (room && playerRef.current) {
      playerRef.current.seekTo(room.currentTime, 'seconds');
    }
  };

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => updateRoomState.cancel();
  }, [updateRoomState]);

  return (
    <div
      ref={containerRef}
      className="relative h-full bg-black overflow-hidden"
      tabIndex={0}
      onKeyDown={(e) => {
        if (!allowControl && !isController) return;
        
        if (e.key === ' ') {
          e.preventDefault();
          handlePlayPause();
        } else if (e.key === 'ArrowLeft') {
          handleSeek(-10);
        } else if (e.key === 'ArrowRight') {
          handleSeek(10);
        }
      }}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <Loader className="w-12 h-12 text-white" />
        </div>
      )}

      <ReactPlayer
        ref={playerRef}
        url={url}
        width="100%"
        height="100%"
        playing={room?.isPlaying ?? false}
        muted={muted}
        volume={volume}
        playbackRate={room?.playbackRate ?? 1}
        onProgress={handleProgress}
        onReady={handleReady}
        style={{ backgroundColor: 'black' }}
        controls={false}
      />

      <ProgressBar
        played={(room?.currentTime || 0) / (playerRef.current?.getDuration() || 1)}
        onSeek={handleSeekTo}
        onSeekStart={() => setSeeking(true)}
        onSeekEnd={() => setSeeking(false)}
      />

      <VideoPlayerControls
        playing={room?.isPlaying ?? false}
        muted={muted}
        fullscreen={isFullscreen}
        volume={volume}
        playbackRate={room?.playbackRate ?? 1}
        onPlayPause={handlePlayPause}
        onMute={() => setMuted((prev) => !prev)}
        onVolumeChange={setVolume}
        onFullscreen={toggleFullscreen}
        onSeek={handleSeek}
        onPlaybackRateChange={handlePlaybackRateChange}
        disabled={!allowControl && !isController}
      />

      {!allowControl && !isController && (
        <div className="absolute top-4 left-4 bg-black/80 text-white px-3 py-1 rounded-md text-sm">
          View Only Mode
        </div>
      )}
    </div>
  );
}