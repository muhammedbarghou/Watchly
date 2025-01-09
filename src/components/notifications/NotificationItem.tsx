import React from 'react';
import { UserPlus, Video } from 'lucide-react';

interface NotificationItemProps {
  title: string;
  message: string;
  time: string;
  type: 'invite' | 'friend';
}

export function NotificationItem({ title, message, time, type }: NotificationItemProps) {
  const Icon = type === 'invite' ? Video : UserPlus;

  return (
    <div className="px-4 py-3 hover:bg-netflix-gray cursor-pointer">
      <div className="flex gap-3">
        <div className="mt-1">
          <Icon className="w-5 h-5 text-netflix-red" />
        </div>
        <div className="flex-1">
          <p className="font-medium text-sm text-white">{title}</p>
          <p className="text-sm text-gray-400">{message}</p>
          <p className="text-xs text-gray-500 mt-1">{time}</p>
        </div>
      </div>
    </div>
  );
}