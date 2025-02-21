import { Slider } from '../ui/slider';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  FastForward,
  Rewind,
  Maximize,
} from 'lucide-react';

interface VideoPlayerControlsProps {
  playing: boolean;
  muted: boolean;
  volume: number;
  onPlayPause: (isPlaying: boolean) => void;
  onMute: () => void;
  onVolumeChange: (value: number) => void;
  onSeek: (seconds: number) => void;
  onFullscreen: () => void;
}

export function VideoPlayerControls({
  playing,
  muted,
  volume,
  onPlayPause,
  onMute,
  onVolumeChange,
  onSeek,
  onFullscreen,
}: VideoPlayerControlsProps) {
  return (
    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
      <div className="flex items-center gap-4">
        {/* Play/Pause Button */}
        <button
          onClick={() => onPlayPause(!playing)}
          className="text-white hover:text-primary transition"
        >
          {playing ? <Pause size={24} /> : <Play size={24} />}
        </button>

        {/* Seek Buttons */}
        <button
          onClick={() => onSeek(-10)}
          className="text-white hover:text-primary transition"
        >
          <Rewind size={24} />
        </button>
        <button
          onClick={() => onSeek(10)}
          className="text-white hover:text-primary transition"
        >
          <FastForward size={24} />
        </button>

        {/* Volume Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={onMute}
            className="text-white hover:text-primary transition"
          >
            {muted ? <VolumeX size={24} /> : <Volume2 size={24} />}
          </button>
          <Slider
            value={[muted ? 0 : volume * 100]}
            max={100}
            step={1}
            onValueChange={(value) => onVolumeChange(value[0] / 100)}
            className="w-24"
          />
        </div>

        {/* Fullscreen Toggle */}
        <div className="ml-auto">
          <button
            onClick={onFullscreen}
            className="text-white hover:text-primary transition"
          >
            <Maximize size={24} />
          </button>
        </div>
      </div>
    </div>
  );
}