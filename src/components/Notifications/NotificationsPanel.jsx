import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import NotificationItem from './NotificationItem';
import NotificationBadge from './NotificationBadge';
import { useNotifications } from '../../hooks/useNotifications.ts';

const NotificationsPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, markAsRead, handleAccept, handleReject } = useNotifications();
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleNotificationClick = (id) => {
    markAsRead(id);
  };

  return (
    <div className="relative">
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-6 h-6 text-gray-700 dark:text-gray-200" />
        {/* Badge for Unread Notifications */}
        {unreadCount > 0 && <NotificationBadge count={unreadCount} />}
      </button>

      {/* Notifications Dropdown */}
      {isOpen && (
        <>
          {/* Background Overlay */}
          <div 
            className="fixed inset-0 bg-transparent" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg overflow-hidden z-50 dark:bg-gray-800">
            {/* Header */}
            <div className="p-4 border-b dark:border-gray-700">
              <h2 className="text-lg font-bold dark:text-white">Notifications</h2>
            </div>
            {/* Notifications List */}
            <div className="max-h-80 overflow-y-auto">
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    {...notification}
                    onClick={() => handleNotificationClick(notification.id)}
                    onAccept={() => handleAccept(notification.id)}
                    onReject={() => handleReject(notification.id)}
                  />
                ))
              ) : (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                  No notifications yet
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationsPanel;
