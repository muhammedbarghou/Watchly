import * as ToastPrimitive from '@radix-ui/react-toast';
import { cn } from '../../../lib/utils1.ts';
import React from 'react';

const Toast = ({ message, type = 'info', open, onOpenChange }) => {
  return (
    <ToastPrimitive.Provider>
      <ToastPrimitive.Root
        className={cn(
          'fixed bottom-4 right-4 z-50 rounded-lg p-4 shadow-lg',
          type === 'success' && 'bg-green-500',
          type === 'error' && 'bg-red-500',
          type === 'info' && 'bg-blue-500'
        )}
        open={open}
        onOpenChange={onOpenChange}
      >
        <ToastPrimitive.Title className="text-sm font-medium text-white">
          {message}
        </ToastPrimitive.Title>
      </ToastPrimitive.Root>
      <ToastPrimitive.Viewport />
    </ToastPrimitive.Provider>
  );
};

export default Toast;