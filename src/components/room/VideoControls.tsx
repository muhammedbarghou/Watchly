import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  RefreshCw,
  SkipForward,
  SkipBack,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface VideoControlsProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isHost: boolean;
  isReady: boolean;
  onPlayPause: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (volume: number) => void;
  onMuteToggle: () => void;
  onSkip: (seconds: number) => void;
  onRefresh: () => void;
  onFullscreen: () => void;
}

const VideoControls: React.FC<VideoControlsProps> = ({
  isPlaying,
  currentTime,
  duration,
  volume,
  isMuted,
  isHost,
  isReady,
  onPlayPause,
  onSeek,
  onVolumeChange,
  onMuteToggle,
  onSkip,
  onRefresh,
  onFullscreen
}) => {
  const [showControls, setShowControls] = useState<boolean>(true);
  const [seeking, setSeeking] = useState<boolean>(false);
  const [hideTimeout, setHideTimeout] = useState<NodeJS.Timeout | null>(null);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);

  // Format time (seconds) to MM:SS
  const formatTime = (seconds: number): string => {
    if (isNaN(seconds)) return '00:00';
    
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Format duration to HH:MM:SS if over an hour, otherwise MM:SS
  const formatDuration = (seconds: number): string => {
    if (isNaN(seconds)) return '00:00';
    
    if (seconds >= 3600) {
      const hours = Math.floor(seconds / 3600);
      const mins = Math.floor((seconds % 3600) / 60);
      const secs = Math.floor(seconds % 60);
      return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
      return formatTime(seconds);
    }
  };

  // Handle seeking start
  const handleStartSeeking = () => {
    setSeeking(true);
    
    // Show controls while seeking
    setShowControls(true);
    
    // Clear any existing hide timeout
    if (hideTimeout) {
      clearTimeout(hideTimeout);
      setHideTimeout(null);
    }
  };

  // Handle time seek
  const handleSeek = (value: number[]) => {
    onSeek(value[0]);
    setSeeking(false);
    
    // Start the hide timeout again
    startHideTimeout();
  };

  // Handle volume change
  const handleVolumeChange = (value: number[]) => {
    onVolumeChange(value[0] / 100);
  };

  // Create hide timeout
  const startHideTimeout = () => {
    if (hideTimeout) {
      clearTimeout(hideTimeout);
    }
    
    const timeout = setTimeout(() => {
      if (!seeking) {
        setShowControls(false);
      }
    }, 3000);
    
    setHideTimeout(timeout);
  };

  // Mouse move shows controls
  const handleMouseMove = () => {
    setShowControls(true);
    startHideTimeout();
  };

  // Playback speed change
  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    // This would need to be implemented in parent component
    // and applied to the ReactPlayer instance
  };

  // Calculate progress percentage
  const progressPercentage = (currentTime / duration) * 100 || 0;

  return (
    <div 
      className={`transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}
      onMouseMove={handleMouseMove}
    >
      {/* Progress bar */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-mono">{formatTime(currentTime)}</span>
        <div className="relative flex-1 group">
          {/* Progress background */}
          <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
            {/* Buffered progress (placeholder, to be implemented) */}
            <div 
              className="h-full bg-muted-foreground/30 rounded-full" 
              style={{ width: '50%' }} // This would be dynamic based on buffered amount
            ></div>
            {/* Playback progress */}
            <div 
              className="h-full bg-primary rounded-full absolute top-0 left-0" 
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          
          {/* Hover target (larger area for better UX) */}
          <div className="absolute -top-2 left-0 w-full h-5 group-hover:cursor-pointer">
            <Slider
              value={[currentTime]}
              min={0}
              max={duration || 100}
              step={0.1}
              onValueChange={value => handleSeek(value)}
              onValueCommit={value => handleSeek(value)}
              disabled={!isHost || !isReady}
              className={`absolute top-0 opacity-0 group-hover:opacity-100 transition-opacity ${!isHost ? "cursor-not-allowed" : "cursor-pointer"}`}
            />
          </div>
        </div>
        <span className="text-sm font-mono">{formatDuration(duration)}</span>
      </div>
      
      {/* Control buttons */}
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onSkip(-10)}
                  disabled={!isReady || !isHost}
                  className={!isHost ? "opacity-50 cursor-not-allowed" : ""}
                >
                  <SkipBack className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Skip back 10 seconds</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={onPlayPause}
                  disabled={!isReady || !isHost}
                  className={`h-10 w-10 ${!isHost ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isPlaying ? 'Pause' : 'Play'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onSkip(10)}
                  disabled={!isReady || !isHost}
                  className={!isHost ? "opacity-50 cursor-not-allowed" : ""}
                >
                  <SkipForward className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Skip forward 10 seconds</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <div className="flex items-center gap-1 ml-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onMuteToggle}
                    disabled={!isReady || !isHost}
                    className={!isHost ? "opacity-50 cursor-not-allowed" : ""}
                  >
                    {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isMuted ? 'Unmute' : 'Mute'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <div className="w-24 hidden sm:block">
              <Slider
                value={[isMuted ? 0 : volume * 100]}
                min={0}
                max={100}
                step={1}
                onValueChange={isHost ? handleVolumeChange : () => {}}
                disabled={!isHost}
                className={!isHost ? "opacity-50 cursor-not-allowed" : ""}
              />
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          {!isHost && (
            <Badge variant="outline" className="mr-1">
              {isPlaying ? 'Playing' : 'Paused'}
            </Badge>
          )}
          
          {isHost && (
            <Badge className="bg-green-600 text-white mr-1">Host Controls</Badge>
          )}
          
          {/* Playback speed (for host only) */}
          {isHost && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" disabled={!isReady}>
                  <Settings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Playback Speed</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {[0.5, 0.75, 1, 1.25, 1.5, 2].map(speed => (
                  <DropdownMenuItem 
                    key={speed}
                    className={playbackSpeed === speed ? "bg-secondary" : ""}
                    onClick={() => handleSpeedChange(speed)}
                  >
                    {speed === 1 ? 'Normal' : `${speed}x`}
                    {playbackSpeed === speed && <Check className="ml-2 h-4 w-4" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={onRefresh}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Refresh player</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={onFullscreen}>
                  <Maximize className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Fullscreen</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
};

// Add Check icon for the dropdown menu
const Check = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export default VideoControls;