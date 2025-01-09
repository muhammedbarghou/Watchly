import React from 'react';
import { cn } from '../../lib/utils';

interface DropdownProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

export function Dropdown({ isOpen, onClose, children, className }: DropdownProps) {
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0" onClick={onClose} />
      <div className={cn(
        "absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-2",
        className
      )}>
        {children}
      </div>
    </>
  );
}