import { 
  Play, Pause, Volume2, VolumeX, 
  Maximize, Minimize, SkipBack, SkipForward 
} from 'lucide-react';
import { Button } from '../ui/button';

interface VideoPlayerControlsProps {
  playing: boolean;
  muted: boolean;
  fullscreen: boolean;
  volume: number;
  onPlayPause: () => void;
  onMute: () => void;
  onVolumeChange: (value: number) => void;
  onFullscreen: () => void;
  onSeek: (seconds: number) => void;
}

export function VideoPlayerControls({
  playing,
  muted,
  fullscreen,
  volume,
  onPlayPause,
  onMute,
  onVolumeChange,
  onFullscreen,
  onSeek
}: VideoPlayerControlsProps) {
  return (
    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onPlayPause}
          aria-label={playing ? 'Pause' : 'Play'}
        >
          {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={onMute}
          aria-label={muted ? 'Unmute' : 'Mute'}
        >
          {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </Button>

        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={volume}
          onChange={(e) => onVolumeChange(Number(e.target.value))}
          className="w-24"
          aria-label="Volume"
        />

        <div className="flex-1" />

        <Button
          variant="ghost"
          size="icon"
          onClick={() => onSeek(-10)}
          aria-label="Rewind 10 seconds"
        >
          <SkipBack className="w-5 h-5" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => onSeek(10)}
          aria-label="Forward 10 seconds"
        >
          <SkipForward className="w-5 h-5" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={onFullscreen}
          aria-label={fullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
        >
          {fullscreen ? (
            <Minimize className="w-5 h-5" />
          ) : (
            <Maximize className="w-5 h-5" />
          )}
        </Button>
      </div>
    </div>
  );
}