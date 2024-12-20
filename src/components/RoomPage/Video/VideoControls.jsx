import React, { useState, useEffect } from 'react';
import * as Slider from '@radix-ui/react-slider';
import { Play, Pause, Volume2, VolumeX, Maximize } from 'lucide-react';
import { useVideoStore } from '../../../store/useVideoStore.ts';
import { formatTime } from '../../../lib/utils1.ts';
import { cn } from '../../../lib/utils1.ts';

const VideoControls = ({ onSeek, onVolumeChange, onPlayPause, onToggleFullScreen }) => {
  const { isPlaying, currentTime, duration, volume } = useVideoStore();
  const [showControls, setShowControls] = useState(true);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    let timeout;
    if (isPlaying) {
      timeout = setTimeout(() => setShowControls(false), 3000);
    }
    return () => clearTimeout(timeout);
  }, [isPlaying, currentTime]);

  const handleVolumeToggle = () => {
    setIsMuted(!isMuted);
    onVolumeChange(isMuted ? volume : 0);
  };

  return (
    <div
      className={cn(
        'absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300',
        showControls ? 'opacity-100' : 'opacity-0'
      )}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      <div className="flex flex-col gap-2">
        <Slider.Root
          className="relative flex items-center select-none touch-none w-full h-5"
          value={[currentTime]}
          max={duration}
          step={1}
          onValueChange={([value]) => onSeek(value)}
        >
          <Slider.Track className="bg-white/30 relative grow rounded-full h-[3px]">
            <Slider.Range className="absolute bg-white rounded-full h-full" />
          </Slider.Track>
          <Slider.Thumb
            className="block w-3 h-3 bg-white rounded-full hover:bg-white/90 focus:outline-none"
            aria-label="Time"
          />
        </Slider.Root>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onPlayPause}
              className="p-2 hover:bg-white/10 rounded-full transition"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={handleVolumeToggle}
                className="p-2 hover:bg-white/10 rounded-full transition"
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
              <Slider.Root
                className="relative flex items-center select-none touch-none w-[100px] h-5"
                value={[isMuted ? 0 : volume * 100]}
                max={100}
                step={1}
                onValueChange={([value]) => onVolumeChange(value / 100)}
              >
                <Slider.Track className="bg-white/30 relative grow rounded-full h-[3px]">
                  <Slider.Range className="absolute bg-white rounded-full h-full" />
                </Slider.Track>
                <Slider.Thumb
                  className="block w-3 h-3 bg-white rounded-full hover:bg-white/90 focus:outline-none"
                  aria-label="Volume"
                />
              </Slider.Root>
            </div>
            <button
              onClick={onToggleFullScreen}
              className="text-white hover:text-white/80 ml-2"
            >
              <Maximize size={20} />
            </button>
          </div>

          <div className="text-sm">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoControls;