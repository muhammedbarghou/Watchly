import React from 'react';
import { Bell } from 'lucide-react';
import { DropdownMenu } from '../ui/dropdown-menu';
import { NotificationItem } from './NotificationItem';

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = React.useState(false);
  
  // Sample notifications array
  const notifications = [
    {
      title: "Watch Party Invitation",
      message: "invited you to watch 'The Matrix'",
      time: "5m ago",
      type: "invite",
      user: {
        name: "John Smith",
        image: "https://example.com/john.jpg"
      },
      isRead: false
    }
    // ... add more notifications as needed
  ];

  return (
    <div className="relative">
      <button 
        className="p-2 hover:bg-netflix-gray rounded-lg relative"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="w-6 h-6 text-gray-400" />
        {notifications.length > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-netflix-red rounded-full" />
        )}
      </button>
      
      <DropdownMenu isOpen={isOpen} onClose={() => setIsOpen(false)} className="w-80">
        <div className="px-4 py-2 border-b border-netflix-gray">
          <h3 className="font-semibold text-white">Notifications</h3>
        </div>
        <div className="max-h-[400px] overflow-y-auto">
          {notifications.map((item) => (
            <NotificationItem 
              key={item.title}
              title={item.title}
              message={item.message}
              time={item.time}
              type={item.type}
              user={item.user}
              isRead={item.isRead}
            />
          ))}
        </div>
      </DropdownMenu>
    </div>
  );
}