export function Loader({ className }: { className?: string }) {
    return (
      <div className={`animate-spin rounded-full border-4 border-t-transparent ${className}`} />
    );
  }