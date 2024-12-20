import React from 'react';

interface NotificationBadgeProps {
  count: number;
}

const NotificationBadge: React.FC<NotificationBadgeProps> = ({ count }) => {
  if (count === 0) return null;

  return (
    <span className="absolute -top-1 -right-1 bg-[#d00000] text-white text-xs font-medium rounded-full min-w-[20px] h-5 flex items-center justify-center px-1">
      {count > 99 ? '99+' : count}
    </span>
  );
};

export default NotificationBadge;