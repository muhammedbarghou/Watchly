interface ProgressBarProps {
    played: number;
    onSeek: (value: number) => void;
    onSeekStart: () => void;
    onSeekEnd: () => void;
  }
  
  export function ProgressBar({ played, onSeek, onSeekStart, onSeekEnd }: ProgressBarProps) {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseFloat(e.target.value);
      onSeek(value);
    };
  
    return (
      <div className="absolute bottom-16 left-0 right-0 px-4">
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={played}
          onChange={handleChange}
          onMouseDown={onSeekStart}
          onMouseUp={onSeekEnd}
          className="w-full h-2 bg-gray-700 rounded-full appearance-none cursor-pointer"
          aria-label="Video progress"
        />
      </div>
    );
  }