import React from 'react';
import { cn } from '../../lib/utils';

interface DropdownMenuProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'right';
}

export function DropdownMenu({ isOpen, onClose, children, className, align = 'right' }: DropdownMenuProps) {
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className={cn(
        "absolute z-50 mt-2 w-56 rounded-lg border border-netflix-gray bg-netflix-black shadow-lg py-1",
        align === 'right' ? 'right-0' : 'left-0',
        className
      )}>
        {children}
      </div>
    </>
  );
}