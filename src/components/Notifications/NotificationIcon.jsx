import React from 'react';
import { Bell, UserPlus } from 'lucide-react';

const iconMap = {
  friendRequest: UserPlus,
  roomRequest: Bell,
};

const NotificationIcon = ({ type, className = '' }) => {
  const Icon = iconMap[type];
  return <Icon className={`text-white ${className}`} size={16} />;
};

export default NotificationIcon;