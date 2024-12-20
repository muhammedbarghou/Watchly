import { useState } from 'react';
import { NotificationType } from '../components/Notifications/NotificationIcon';

interface Notification {
  id: number;
  type: NotificationType;
  content: string;
  timestamp: string;
  isRead: boolean;
  userImage: string;
}

const mockNotifications: Notification[] = [
  {
    id: 1,
    type: 'friendRequest',
    content: 'Mike Johnson sent you a friend request',
    timestamp: '2 min ago',
    isRead: false,
    userImage: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=150&h=150&fit=crop',
  },
  {
    id: 2,
    type: 'roomRequest',
    content: 'Emily Wilson invited you to join the room "Movie Night"',
    timestamp: '15 min ago',
    isRead: false,
    userImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
  },
];

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);

  const markAsRead = (id: number) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const handleAccept = (id: number) => {
    // Handle accepting friend request or room invitation
    markAsRead(id);
    setNotifications(prev => prev.filter(notification => notification.id !== id));
    // Here you would typically make an API call to accept the request
  };

  const handleReject = (id: number) => {
    // Handle rejecting friend request or room invitation
    markAsRead(id);
    setNotifications(prev => prev.filter(notification => notification.id !== id));
    // Here you would typically make an API call to reject the request
  };

  return {
    notifications,
    markAsRead,
    handleAccept,
    handleReject,
  };
};