import { useRef, useState } from 'react';
import ReactPlayer from 'react-player';
import { VideoPlayerControls } from './VideoPlayerControls';
import { useFullscreen } from '../../hooks/use-fullscreen';
import { ProgressBar } from './ProgressBar';
import { Loader } from '../ui/loader';

interface VideoPlayerProps {
  url: string;
  onProgress?: (state: { played: number; playedSeconds: number }) => void;
  onPause?: () => void;
  onPlay?: () => void;
}

export function VideoPlayer({ url, onProgress, onPause, onPlay }: VideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<ReactPlayer>(null);
  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [played, setPlayed] = useState(0); // Track played progress
  const [seeking, setSeeking] = useState(false); // Track seeking state
  const [loading, setLoading] = useState(true); // Track loading state
  const { isFullscreen, toggleFullscreen } = useFullscreen(containerRef);

  const handlePlayPause = () => {
    setPlaying(!playing);
    playing ? onPause?.() : onPlay?.();
  };

  const handleSeek = (seconds: number) => {
    const player = playerRef.current;
    if (player) {
      const currentTime = player.getCurrentTime();
      player.seekTo(currentTime + seconds);
    }
  };

  const handleProgress = (state: { played: number; playedSeconds: number }) => {
    if (!seeking) {
      setPlayed(state.played);
    }
    onProgress?.(state);
  };

  const handleSeekTo = (value: number) => {
    const player = playerRef.current;
    if (player) {
      player.seekTo(value);
      setPlayed(value);
    }
  };

  const handleReady = () => {
    setLoading(false); // Hide loader when video is ready
  };

  const handleError = (error: any) => {
    console.error('Video playback error:', error);
    setLoading(false); // Hide loader on error
  };

  return (
    <div
      ref={containerRef}
      className="relative h-full bg-black overflow-hidden"
      tabIndex={0} // Enable keyboard focus
      onKeyDown={(e) => {
        // Add keyboard shortcuts
        if (e.key === ' ') {
          handlePlayPause();
        } else if (e.key === 'ArrowLeft') {
          handleSeek(-10);
        } else if (e.key === 'ArrowRight') {
          handleSeek(10);
        }
      }}
    >
      {/* Loading Spinner */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <Loader className="w-12 h-12 text-white" />
        </div>
      )}

      {/* Video Player */}
      <ReactPlayer
        ref={playerRef}
        url={url}
        width="100%"
        height="100%"
        playing={playing}
        muted={muted}
        volume={volume}
        onProgress={handleProgress}
        onReady={handleReady}
        onError={handleError}
        style={{ backgroundColor: 'black' }}
      />

      {/* Progress Bar */}
      <ProgressBar
        played={played}
        onSeek={handleSeekTo}
        onSeekStart={() => setSeeking(true)}
        onSeekEnd={() => setSeeking(false)}
      />

      {/* Video Controls */}
      <VideoPlayerControls
        playing={playing}
        muted={muted}
        fullscreen={isFullscreen}
        volume={volume}
        onPlayPause={handlePlayPause}
        onMute={() => setMuted(!muted)}
        onVolumeChange={setVolume}
        onFullscreen={toggleFullscreen}
        onSeek={handleSeek}
      />
    </div>
  );
}