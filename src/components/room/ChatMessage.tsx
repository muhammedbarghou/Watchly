import React from 'react';
import { formatDistanceToNow } from 'date-fns';

interface ChatMessageProps {
  username: string;
  message: string;
  timestamp: Date;
  isOwn?: boolean;
}

export function ChatMessage({ username, message, timestamp, isOwn }: ChatMessageProps) {
  return (
    <div className={`px-4 py-2 hover:bg-netflix-gray/50 ${isOwn ? 'bg-netflix-gray/20' : ''}`}>
      <div className="flex items-start gap-2">
        <div className="w-8 h-8 rounded bg-netflix-red flex items-center justify-center shrink-0">
          <span className="text-sm font-medium text-white">
            {username.slice(0, 2).toUpperCase()}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="font-medium text-white truncate">{username}</span>
            <span className="text-xs text-gray-500">
              {formatDistanceToNow(timestamp, { addSuffix: true })}
            </span>
          </div>
          <p className="text-gray-300 break-words">{message}</p>
        </div>
      </div>
    </div>
  );
}