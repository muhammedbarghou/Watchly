import React, { useState, useRef, useEffect } from 'react';
import ReactPlayer from 'react-player';
import { 
  doc, 
  updateDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'sonner';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  RefreshCw,
  SkipForward,
  SkipBack
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface VideoPlayerPanelProps {
  videoUrl: string;
  roomId: string;
  documentId: string;
  isHost: boolean;
  initialTime?: number;
  initialPlaying?: boolean;
  onError?: (error: any) => void;
}

const VideoPlayerPanel: React.FC<VideoPlayerPanelProps> = ({
  videoUrl,
  roomId,
  documentId,
  isHost,
  initialTime = 0,
  initialPlaying = false,
  onError
}) => {
  // Player state
  const playerRef = useRef<ReactPlayer>(null);
  const [isVideoReady, setIsVideoReady] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(initialPlaying);
  const [currentTime, setCurrentTime] = useState<number>(initialTime);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(1); // 0-1 scale
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [seeking, setSeeking] = useState<boolean>(false);
  const [bufferingState, setBufferingState] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Refs for tracking state changes to prevent loops
  const playerStateChangeRef = useRef<boolean>(false);
  const syncIntervalRef = useRef<number | null>(null);

  // Format time (seconds) to MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Sync video state periodically if host
  useEffect(() => {
    if (isHost && isVideoReady && documentId) {
      syncIntervalRef.current = window.setInterval(() => {
        if (playerRef.current) {
          updateDoc(doc(db, 'rooms', documentId), {
            currentTime: playerRef.current.getCurrentTime(),
            isPlaying: isPlaying,
            updatedAt: serverTimestamp(),
          }).catch(error => {
            console.error('Error syncing video state:', error);
          });
        }
      }, 5000); // Sync every 5 seconds
    }

    return () => {
      if (syncIntervalRef.current) {
        window.clearInterval(syncIntervalRef.current);
      }
    };
  }, [isHost, isVideoReady, documentId, isPlaying]);

  // Toggle play state
  const togglePlay = async () => {
    if (!documentId || !isHost) return;
    
    playerStateChangeRef.current = true;
    setIsPlaying(!isPlaying);
    
    try {
      await updateDoc(doc(db, 'rooms', documentId), {
        isPlaying: !isPlaying,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating play state:', error);
      toast.error('Failed to update playback state');
    }
  };

  // Skip forward/backward
  const handleSkip = async (skipSeconds: number) => {
    if (!documentId || !isHost || !playerRef.current) return;
    
    const currentPlayerTime = playerRef.current.getCurrentTime();
    const newTime = Math.max(0, Math.min(currentPlayerTime + skipSeconds, duration));
    
    playerStateChangeRef.current = true;
    setCurrentTime(newTime);
    playerRef.current.seekTo(newTime, 'seconds');
    
    try {
      await updateDoc(doc(db, 'rooms', documentId), {
        currentTime: newTime,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating time:', error);
      toast.error('Failed to update playback position');
    }
  };

  // React Player event handlers
  const handleProgress = (state: { played: number; playedSeconds: number; loaded: number; loadedSeconds: number }) => {
    if (!seeking) {
      setCurrentTime(state.playedSeconds);
    }
  };

  const handleDuration = (duration: number) => {
    setDuration(duration || 0);
  };

  const handleReady = () => {
    setIsVideoReady(true);
    
    // Sync with initial state
    if (initialTime && playerRef.current) {
      playerRef.current.seekTo(initialTime, 'seconds');
    }
  };

  const handleError = (error: any) => {
    console.error("ReactPlayer error:", error);
    if (onError) onError(error);
    toast.error("Error loading video. Check if the URL is valid and accessible.");
  };

  const handleStartSeeking = () => {
    setSeeking(true);
  };

  const handleTimeSeek = (value: number[]) => {
    if (!documentId) return;
    
    const seekTime = value[0];
    setCurrentTime(seekTime);
    
    if (playerRef.current) {
      playerRef.current.seekTo(seekTime, 'seconds');
    }
    
    if (isHost) {
      playerStateChangeRef.current = true;
      
      updateDoc(doc(db, 'rooms', documentId), {
        currentTime: seekTime,
        updatedAt: serverTimestamp(),
      }).catch(error => {
        console.error('Error updating time:', error);
      });
    }
    
    setSeeking(false);
  };

  const handleVolumeChange = (value: number[]) => {
    const volumeValue = value[0] / 100; // Convert to 0-1 range for ReactPlayer
    setVolume(volumeValue);
    
    if (volumeValue === 0) {
      setIsMuted(true);
    } else {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const toggleFullscreen = () => {
    const playerContainer = document.querySelector('.player-container');
    if (!playerContainer) return;

    if (!document.fullscreenElement) {
      playerContainer.requestFullscreen().catch(err => {
        toast.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Handle fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const handleRefresh = () => {
    if (playerRef.current) {
      // Reload the player
      const currentTime = playerRef.current.getCurrentTime();
      playerRef.current.seekTo(currentTime, 'seconds');
      toast.info("Video player refreshed");
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="relative w-full player-container bg-black flex-1 flex items-center justify-center">
        <ReactPlayer
          ref={playerRef}
          url={videoUrl}
          className="react-player"
          width="100%"
          height="100%"
          playing={isPlaying}
          volume={volume}
          muted={isMuted}
          onReady={handleReady}
          onProgress={handleProgress}
          onDuration={handleDuration}
          onError={handleError}
          onBufferEnd={() => setBufferingState(false)}
          onBuffer={() => setBufferingState(true)}
          onPlay={() => {
            if (!isHost) {
              if (playerRef.current && !isPlaying) {
                playerRef.current.seekTo(currentTime);
                return false;
              }
            } else {
              setIsPlaying(true);
            }
          }}
          onPause={() => {
            if (!isHost) {
              if (playerRef.current && isPlaying) {
                setTimeout(() => {
                  if (playerRef.current) playerRef.current.seekTo(currentTime);
                }, 50);
                return false;
              }
            } else {
              setIsPlaying(false);
            }
          }}
          config={{
            youtube: {
              playerVars: { 
                disablekb: !isHost ? 1 : 0,
                modestbranding: 1,
                origin: window.location.origin,
                controls: 0 // Hide YouTube's own controls
              }
            },
            file: {
              attributes: {
                controlsList: 'nodownload',
                disablePictureInPicture: true
              }
            }
          }}
        />
        
        {/* Overlay to prevent non-host users from clicking on video */}
        {!isHost && (
          <div 
            className="absolute inset-0 bg-transparent cursor-not-allowed z-10" 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toast.info("Only the host can control playback");
            }}
          />
        )}
        
        {/* Buffering indicator */}
        {bufferingState && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 z-20">
            <div className="flex flex-col items-center">
              <RefreshCw className="h-12 w-12 animate-spin text-white" />
              <span className="text-white mt-2">Buffering...</span>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <Card className="rounded-none border-x-0 border-b-0">
        <CardContent className="p-4 space-y-3">
          {/* Progress bar */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-mono">{formatTime(currentTime)}</span>
            <Slider
              value={[currentTime]}
              min={0}
              max={duration || 100}
              step={0.1}
              onValueChange={value => {
                setCurrentTime(value[0]);
                if (isHost) handleStartSeeking();
              }}
              onValueCommit={isHost ? handleTimeSeek : () => {}}
              className={`flex-1 ${!isHost ? "opacity-50 cursor-not-allowed" : ""}`}
              disabled={!isHost}
            />
            <span className="text-sm font-mono">{formatTime(duration)}</span>
          </div>
          
          {/* Playback controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleSkip(-10)}
                      disabled={!isVideoReady || !isHost}
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
                      onClick={togglePlay}
                      disabled={!isVideoReady || !isHost}
                      className={!isHost ? "opacity-50 cursor-not-allowed" : ""}
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
                      onClick={() => handleSkip(10)}
                      disabled={!isVideoReady || !isHost}
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
              
              <div className="flex items-center gap-2 ml-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleMute}
                        disabled={!isVideoReady || !isHost}
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
                
                <Slider
                  value={[isMuted ? 0 : volume * 100]}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={isHost ? handleVolumeChange : () => {}}
                  className={`w-24 ${!isHost ? "opacity-50 cursor-not-allowed" : ""}`}
                  disabled={!isHost}
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {!isHost && (
                <Badge variant="outline" className="ml-auto">
                  {isPlaying ? 'Playing' : 'Paused'}
                </Badge>
              )}
              
              {isHost && (
                <Badge className="bg-green-600 text-white">Host Controls</Badge>
              )}
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={handleRefresh}>
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
                    <Button variant="ghost" size="icon" onClick={toggleFullscreen}>
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

          {/* Video URL and info (collapsible) */}
          <details className="text-xs text-muted-foreground">
            <summary className="cursor-pointer">Video Information</summary>
            <p className="mt-1 break-all">URL: {videoUrl}</p>
            <p className="mt-1">Status: {isVideoReady ? 'Ready' : 'Loading'}</p>
            <p className="mt-1">Player: ReactPlayer</p>
            <p className="mt-1">Control Mode: {isHost ? 'Host (Full Control)' : 'Viewer (No Control)'}</p>
          </details>
        </CardContent>
      </Card>
    </div>
  );
};

export default VideoPlayerPanel;