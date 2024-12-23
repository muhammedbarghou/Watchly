// @ts-ignore
import React from 'react';
import { Bell,  UserPlus } from 'lucide-react';

export type NotificationType = 'friendRequest' | 'roomRequest';

interface NotificationIconProps {
  type: NotificationType;
  className?: string;
}

const iconMap = {
  friendRequest: UserPlus,
  roomRequest: Bell,
};

const NotificationIcon: React.FC<NotificationIconProps> = ({ type, className = '' }) => {
  const Icon = iconMap[type];
  return <Icon className="text-white" size={16} />;
};

export default NotificationIcon;