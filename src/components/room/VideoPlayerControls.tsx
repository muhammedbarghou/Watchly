import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  SkipBack,
  SkipForward,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Slider } from '../ui/slider'; // Use a custom Slider component for better styling

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
  onSeek,
}: VideoPlayerControlsProps) {
  return (
    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
      <div className="flex items-center gap-4">
        {/* Play/Pause Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onPlayPause}
          aria-label={playing ? 'Pause' : 'Play'}
          className="hover:bg-white/10 rounded-full p-2 transition-colors"
        >
          {playing ? (
            <Pause className="w-6 h-6 text-white" />
          ) : (
            <Play className="w-6 h-6 text-white" />
          )}
        </Button>

        {/* Volume Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMute}
            aria-label={muted ? 'Unmute' : 'Mute'}
            className="hover:bg-white/10 rounded-full p-2 transition-colors"
          >
            {muted ? (
              <VolumeX className="w-6 h-6 text-white" />
            ) : (
              <Volume2 className="w-6 h-6 text-white" />
            )}
          </Button>

          <Slider
            min={0}
            max={1}
            step={0.1}
            value={[volume]}
            onValueChange={(value) => onVolumeChange(value[0])}
            className="w-24"
            aria-label="Volume"
          />
        </div>

        {/* Seek Buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onSeek(-10)}
            aria-label="Rewind 10 seconds"
            className="hover:bg-white/10 rounded-full p-2 transition-colors"
          >
            <SkipBack className="w-6 h-6 text-white" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => onSeek(10)}
            aria-label="Forward 10 seconds"
            className="hover:bg-white/10 rounded-full p-2 transition-colors"
          >
            <SkipForward className="w-6 h-6 text-white" />
          </Button>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Fullscreen Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onFullscreen}
          aria-label={fullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          className="hover:bg-white/10 rounded-full p-2 transition-colors"
        >
          {fullscreen ? (
            <Minimize className="w-6 h-6 text-white" />
          ) : (
            <Maximize className="w-6 h-6 text-white" />
          )}
        </Button>
      </div>
    </div>
  );
}