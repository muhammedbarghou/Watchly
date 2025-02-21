import { useState, useRef } from 'react';

interface ProgressBarProps {
  played: number; // Fraction of video played (0 to 1)
  duration: number; // Total duration of the video in seconds
  onSeek: (time: number) => void; // Callback to handle seeking
}

export function ProgressBar({ played, duration, onSeek }: ProgressBarProps) {
  const [hovering, setHovering] = useState(false);
  const [tooltipTime, setTooltipTime] = useState('00:00'); // Tooltip time display
  const progressRef = useRef<HTMLDivElement>(null);

  // Calculate the seek time based on mouse position
  const calculateTime = (e: React.MouseEvent): number => {
    if (!progressRef.current || !duration) return 0;
    const rect = progressRef.current.getBoundingClientRect();
    const percentage = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
    return percentage * duration;
  };

  // Handle mouse move to update tooltip time
  const handleMouseMove = (e: React.MouseEvent) => {
    const time = calculateTime(e);
    setTooltipTime(formatTime(time)); // Format time for display
  };

  // Handle click to seek the video
  const handleClick = (e: React.MouseEvent) => {
    const time = calculateTime(e);
    onSeek(time); // Pass the calculated time to the onSeek callback
  };

  // Format time in MM:SS format
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  };

  return (
    <div
      ref={progressRef}
      className=" bottom-14 left-0 right-0 h-1 bg-gray-600 cursor-pointer group relative"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onMouseMove={handleMouseMove}
      onClick={handleClick}
    >
      {/* Played portion */}
      <div
        className="h-full bg-primary transition-all"
        style={{ width: `${played * 100}%` }}
      />

      {/* Tooltip for hover time */}
      {hovering && (
        <div
          className="absolute top-[-2rem] left-1/2 transform -translate-x-1/2 bg-black text-white px-2 py-1 rounded text-sm"
          style={{
            left: `${played * 100}%`,
          }}
        >
          {tooltipTime}
        </div>
      )}

      {/* Seek handle */}
      <div
        className={`h-3 w-3 bg-primary rounded-full absolute top-1/2 -translate-y-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity ${
          hovering ? 'opacity-100' : ''
        }`}
        style={{ left: `${played * 100}%` }}
      />
    </div>
  );
}