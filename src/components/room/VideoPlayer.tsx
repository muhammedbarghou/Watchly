import { useRef, useState } from 'react';
import ReactPlayer from 'react-player';
import { VideoPlayerControls } from './VideoPlayerControls';
import { useFullscreen } from '../../hooks/use-fullscreen';

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

  return (
    <div ref={containerRef} className="relative aspect-video bg-black rounded-lg overflow-hidden">
      <ReactPlayer
        ref={playerRef}
        url={url}
        width="100%"
        height="100%"
        playing={playing}
        muted={muted}
        volume={volume}
        onProgress={onProgress}
        style={{ backgroundColor: 'black' }}
      />
      
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