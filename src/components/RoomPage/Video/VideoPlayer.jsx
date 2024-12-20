import React from 'react';
import ReactPlayer from 'react-player';
import { useVideoStore } from '../../../store/useVideoStore.ts';
import  VideoControls  from './VideoControls';

export const VideoPlayer = ({ url }) => {
  const playerRef = React.useRef(null);
  const containerRef = React.useRef(null);
  const { isPlaying, setPlaying, setCurrentTime, setDuration, volume, setVolume } = useVideoStore();

  const handleProgress = React.useCallback(({ playedSeconds }) => {
    setCurrentTime(playedSeconds);
  }, [setCurrentTime]);

  const handleDuration = React.useCallback((duration) => {
    setDuration(duration);
  }, [setDuration]);

  const handlePlayPause = () => {
    setPlaying(!isPlaying);
  };

  const handleSeek = (time) => {
    playerRef.current?.seekTo(time, 'seconds');
  };

  const handleVolumeChange = (newVolume) => {
    setVolume(newVolume);
  };

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <div ref={containerRef} className="relative w-full h-full bg-black">
      <ReactPlayer
        ref={playerRef}
        url={url}
        playing={isPlaying}
        volume={volume}
        width="100%"
        height="100%"
        onProgress={handleProgress}
        onDuration={handleDuration}
        progressInterval={100}
        className="absolute top-0 left-0"
      />
      <VideoControls
        onSeek={handleSeek}
        onVolumeChange={handleVolumeChange}
        onPlayPause={handlePlayPause}
        onToggleFullScreen={toggleFullScreen}
      />
    </div>
  );
};