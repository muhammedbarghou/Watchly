import { useRef, useState, useEffect, useCallback } from 'react';
import ReactPlayer from 'react-player';
import { VideoPlayerControls } from './VideoPlayerControls';
import { useFullscreen } from '../../hooks/use-fullscreen';
import { ProgressBar } from './ProgressBar';
import { Loader } from '../ui/loader';
import { debounce } from 'lodash';

interface VideoPlayerProps {
  url: string;
  onStateChange?: (state: {
    currentTime: number;
    isPlaying: boolean;
    playbackRate: number;
  }) => void;
  initialState?: {
    currentTime: number;
    isPlaying: boolean;
    playbackRate: number;
  } | null;
  isController?: boolean;
  allowControl?: boolean;
}

export function VideoPlayer({ 
  url, 
  onStateChange,
  initialState,
  isController = false,
  allowControl = true 
}: VideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<ReactPlayer>(null);
  const [playing, setPlaying] = useState(initialState?.isPlaying ?? true);
  const [muted, setMuted] = useState(true);
  const [volume, setVolume] = useState(1);
  const [played, setPlayed] = useState(0);
  const [seeking, setSeeking] = useState(false);
  const [loading, setLoading] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(initialState?.playbackRate ?? 1);
  const { isFullscreen, toggleFullscreen } = useFullscreen(containerRef);

  // Sync with initial state
  useEffect(() => {
    if (initialState && playerRef.current) {
      setPlaying(initialState.isPlaying);
      setPlaybackRate(initialState.playbackRate);
      playerRef.current.seekTo(initialState.currentTime, 'seconds');
    }
  }, [initialState]);

  // Debounced state change handler
  const debouncedStateChange = useCallback(
    debounce((state: { currentTime: number; isPlaying: boolean; playbackRate: number }) => {
      onStateChange?.(state);
    }, 500),
    [onStateChange]
  );

  const handlePlayPause = () => {
    if (!allowControl && !isController) return;
    
    setPlaying((prev) => {
      const newPlaying = !prev;
      if (playerRef.current) {
        debouncedStateChange({
          currentTime: playerRef.current.getCurrentTime(),
          isPlaying: newPlaying,
          playbackRate
        });
      }
      return newPlaying;
    });
  };

  const handleSeek = (seconds: number) => {
    if (!allowControl && !isController) return;

    const player = playerRef.current;
    if (player) {
      const currentTime = player.getCurrentTime() + seconds;
      player.seekTo(currentTime, 'seconds');
      debouncedStateChange({
        currentTime,
        isPlaying: playing,
        playbackRate
      });
    }
  };

  const handleProgress = (state: { played: number; playedSeconds: number }) => {
    if (!seeking) {
      setPlayed(state.played);
      if (isController || allowControl) {
        debouncedStateChange({
          currentTime: state.playedSeconds,
          isPlaying: playing,
          playbackRate
        });
      }
    }
  };

  const handleSeekTo = (value: number) => {
    if (!allowControl && !isController) return;

    const player = playerRef.current;
    if (player) {
      player.seekTo(value, 'fraction');
      setPlayed(value);
      debouncedStateChange({
        currentTime: value * player.getDuration(),
        isPlaying: playing,
        playbackRate
      });
    }
  };

  const handlePlaybackRateChange = (rate: number) => {
    if (!allowControl && !isController) return;

    setPlaybackRate(rate);
    if (playerRef.current) {
      debouncedStateChange({
        currentTime: playerRef.current.getCurrentTime(),
        isPlaying: playing,
        playbackRate: rate
      });
    }
  };

  const handleReady = () => {
    console.log('Video is ready to play');
    setLoading(false);
    
    // Apply initial state if available
    if (initialState && playerRef.current) {
      playerRef.current.seekTo(initialState.currentTime, 'seconds');
    }
  };

  const handleError = (error: any) => {
    console.error('Video playback error:', error);
    setLoading(false);
  };

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedStateChange.cancel();
    };
  }, [debouncedStateChange]);

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
        playing={playing}
        muted={muted}
        volume={volume}
        playbackRate={playbackRate}
        onProgress={handleProgress}
        onReady={handleReady}
        onError={handleError}
        style={{ backgroundColor: 'black' }}
        controls={false}
      />

      <ProgressBar
        played={played}
        onSeek={handleSeekTo}
        onSeekStart={() => setSeeking(true)}
        onSeekEnd={() => setSeeking(false)}
      />

      <VideoPlayerControls
        playing={playing}
        muted={muted}
        fullscreen={isFullscreen}
        volume={volume}
        playbackRate={playbackRate}
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