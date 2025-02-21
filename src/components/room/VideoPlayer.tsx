import { useRef, useState } from 'react';
import ReactPlayer from 'react-player';
import { VideoPlayerControls } from './VideoPlayerControls';
import { ProgressBar } from './ProgressBar';
import { useFullscreen } from '../../hooks/use-fullscreen';

interface VideoPlayerProps {
  url: string;
  playing: boolean;
  currentTime: number;
  playbackRate: number;
  onPlayPause: (isPlaying: boolean) => void;
  onSeek: (time: number) => void;
}

export function VideoPlayer({
  url,
  playing,
  currentTime,
  playbackRate,
  onPlayPause,
  onSeek,
}: VideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<ReactPlayer>(null);

  // Fullscreen state
  const { toggleFullscreen } = useFullscreen(containerRef);

  // Video duration state
  const [videoDuration, setVideoDuration] = useState(0);

  // Volume and mute states
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);

  // Handle video ready event to get the duration
  const handleReady = () => {
    if (playerRef.current) {
      const duration = playerRef.current.getDuration();
      if (duration) {
        setVideoDuration(duration);
      }
    }
  };

  // Handle errors
  const handleError = (error: any) => {
    console.error('Video playback error:', error);
  };

  // Handle volume change
  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (newVolume > 0) {
      setMuted(false);
    }
  };

  // Handle mute toggle
  const handleMute = () => {
    setMuted(!muted);
  };

  // Keyboard controls
  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case ' ': // Spacebar to toggle play/pause
        e.preventDefault(); // Prevent scrolling
        onPlayPause(!playing);
        break;
      case 'ArrowLeft': // Seek backward
        onSeek(Math.max(currentTime - 10, 0));
        break;
      case 'ArrowRight': // Seek forward
        onSeek(Math.min(currentTime + 10, videoDuration));
        break;
      case 'f': // Toggle fullscreen
        toggleFullscreen();
        break;
      case 'm': // Toggle mute
        handleMute();
        break;
      case 'ArrowUp': // Increase volume
        handleVolumeChange(Math.min(volume + 0.1, 1));
        break;
      case 'ArrowDown': // Decrease volume
        handleVolumeChange(Math.max(volume - 0.1, 0));
        break;
      default:
        break;
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative h-full bg-black overflow-hidden"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      {/* Video Player */}
      <ReactPlayer
        ref={playerRef}
        url={url}
        width="100%"
        height="100%"
        playing={playing}
        volume={volume}
        muted={muted}
        currentTime={currentTime}
        playbackRate={playbackRate}
        onReady={handleReady}
        onError={handleError}
        style={{ backgroundColor: 'black' }}
      />

      {/* Progress Bar */}
      <ProgressBar
        played={currentTime / videoDuration} // Fraction of video played (0 to 1)
        duration={videoDuration} // Total duration of the video in seconds
        onSeek={onSeek} // Callback to handle seeking
      />

      {/* Video Controls */}
      <VideoPlayerControls
        playing={playing}
        onPlayPause={onPlayPause}
        onSeek={(seconds: number) => onSeek(seconds)} // Adjust seek behavior
        onFullscreen={toggleFullscreen}
        muted={muted}
        volume={volume}
        onMute={handleMute}
        onVolumeChange={handleVolumeChange}
      />
    </div>
  );
}