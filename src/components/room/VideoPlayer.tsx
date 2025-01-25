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
  const [muted, setMuted] = useState(true); // Mute initially to bypass autoplay restrictions
  const [volume, setVolume] = useState(1);
  const [played, setPlayed] = useState(0);
  const [seeking, setSeeking] = useState(false);
  const [loading, setLoading] = useState(true);
  const { isFullscreen, toggleFullscreen } = useFullscreen(containerRef);

  const handlePlayPause = () => {
    setPlaying((prev) => !prev);
    playing ? onPause?.() : onPlay?.();
  };

  const handleSeek = (seconds: number) => {
    const player = playerRef.current;
    if (player) {
      const currentTime = player.getCurrentTime();
      player.seekTo(currentTime + seconds, 'seconds');
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
      player.seekTo(value, 'fraction');
      setPlayed(value);
    }
  };

  const handleReady = () => {
    console.log('Video is ready to play');
    setLoading(false);
  };

  const handleError = (error: any) => {
    console.error('Video playback error:', error);
    setLoading(false);
  };

  console.log('Video URL:', url); // Debug the URL

  return (
    <div
      ref={containerRef}
      className="relative h-full bg-black overflow-hidden"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === ' ') {
          e.preventDefault(); // Prevent default spacebar behavior (scrolling)
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
        onProgress={handleProgress}
        onReady={handleReady}
        onError={handleError}
        style={{ backgroundColor: 'black' }}
        controls={false} // Disable default controls to use custom ones
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
        onPlayPause={handlePlayPause}
        onMute={() => setMuted((prev) => !prev)}
        onVolumeChange={setVolume}
        onFullscreen={toggleFullscreen}
        onSeek={handleSeek}
      />
    </div>
  );
}