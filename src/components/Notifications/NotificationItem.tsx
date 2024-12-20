import React from 'react';
import NotificationIcon, { NotificationType } from './NotificationIcon.tsx';
import { Check, X } from 'lucide-react';

interface NotificationItemProps {
  id: number;
  type: NotificationType;
  content: string;
  timestamp: string;
  isRead: boolean;
  userImage: string;
  onClick?: () => void;
  onAccept?: () => void;
  onReject?: () => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  type,
  content,
  timestamp,
  isRead,
  userImage,
  onClick,
  onAccept,
  onReject,
}) => {
  return (
    <div 
      onClick={onClick}
      className={`flex items-start gap-3 p-4 bg-white cursor-pointer transition-colors dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 ${
        !isRead ? 'bg-[#d00000]' : ''
      }`}
    >
      <div className="relative flex-shrink-0">
        <img
          src={userImage}
          alt="User avatar"
          className="w-12 h-12 rounded-full object-cover border border-gray-200"
        />
        <div className="absolute -bottom-1 -right-1 bg-[#d00000] p-1.5 rounded-full">
          <NotificationIcon type={type} className="text-white" />
        </div>
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-800 line-clamp-2 dark:text-white">{content}</p>
        <span className="text-xs font-medium text-red-500 mt-1 block">
          {timestamp}
        </span>
      </div>
      <div className="flex gap-2">
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onAccept?.();
          }}
          className="p-1.5 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
        >
          <Check size={16} />
        </button>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onReject?.();
          }}
          className="p-1.5 bg-[#d00000] text-white rounded-full hover:bg-[#6A040F] transition-colors"
        >
          <X size={16} />
        </button>
      </div>
      
      {!isRead && (
        <div className="w-3 h-3 rounded-full bg-[#d00000] flex-shrink-0 mt-2" />
      )}
    </div>
  );
};

export default NotificationItem;