import React from "react";
import { UserPlus, Video, X, CheckSquare, User } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { 
  Notification,
  NotificationType
} from "@/hooks/use-notifications";
import { formatDistanceToNow } from 'date-fns';

interface NotificationItemProps {
  notification: Notification;
  onAccept?: (notification: Notification) => void;
  onDecline?: (notification: Notification) => void;
  onJoin?: (notification: Notification) => void;
  onDelete?: (notification: Notification) => void;
  onRead?: (notification: Notification) => void;
}

export function NotificationItem({ 
  notification,
  onAccept,
  onDecline,
  onJoin,
  onDelete,
  onRead
}: NotificationItemProps) {
  // Determine icon based on notification type
  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'friend_request':
        return <UserPlus className="w-3.5 h-3.5 text-red-500" />;
      case 'room_invitation':
      case 'friend_joined_room':
        return <Video className="w-3.5 h-3.5 text-blue-500" />;
      default:
        return null;
    }
  };
  
  // Process a relative time string from the notification timestamp
  const getTimeString = (timestamp: any) => {
    if (!timestamp) return 'Just now';
    
    try {
      const date = timestamp.toDate();
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      return 'Recently';
    }
  };
  
  // Get notification title
  const getTitle = (notification: Notification) => {
    switch (notification.type) {
      case 'friend_request':
        return 'Friend Request';
      case 'room_invitation':
        return 'Room Invitation';
      case 'friend_joined_room':
        return 'Friend Joined Room';
      default:
        return 'Notification';
    }
  };
  
  // Get notification message
  const getMessage = (notification: Notification) => {
    const senderName = notification.senderName || 'Someone';
    
    switch (notification.type) {
      case 'friend_request':
        return `${senderName} wants to be your friend`;
      case 'room_invitation':
        return `${senderName} invited you to join "${notification.roomName}"`;
      case 'friend_joined_room':
        return `${senderName} joined room "${notification.roomName}"`;
      default:
        return notification.message || 'You have a new notification';
    }
  };
  
  // Handle automatic read status when viewing notification
  React.useEffect(() => {
    if (!notification.read && onRead) {
      onRead(notification);
    }
  }, [notification, onRead]);

  return (
    <Card
      className={cn(
        "w-full",
        !notification.read 
          ? "dark:bg-gray-900/30 bg-gray-100" 
          : "dark:bg-gray-800/20 bg-white",
      )}
    >
      <div className="p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="relative flex-shrink-0">
            <Avatar className="h-12 w-12 ring-2 ring-gray-700/50 transition-all duration-200 hover:ring-gray-600">
              <AvatarImage src={notification.senderPhotoURL || ''} alt={notification.senderName || 'User'} className="object-cover" />
              <AvatarFallback className="dark:bg-gray-800 bg-gray-200 dark:text-gray-200 text-gray-700 font-medium">
                {notification.senderName
                  ? notification.senderName.split(" ").map((n) => n[0]).join("")
                  : <User className="h-5 w-5" />
                }
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 rounded-full dark:bg-gray-900 bg-white p-1.5 ring-2 dark:ring-gray-800 ring-gray-200">
              {getIcon(notification.type)}
            </div>
          </div>

          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex justify-between items-start gap-2">
              <div className="flex-1">
                <p className="text-sm font-medium dark:text-gray-100 text-gray-800 line-clamp-2">
                  <span className="font-semibold">{getTitle(notification)}: </span>
                  <span className="dark:text-gray-400 text-gray-600 font-normal">{getMessage(notification)}</span>
                </p>
                <p className="text-xs dark:text-gray-500 text-gray-600 mt-1">
                  {getTimeString(notification.timestamp)}
                </p>
              </div>
              {!notification.read && <div className="w-2 h-2 rounded-full bg-red-500 mt-1 flex-shrink-0 animate-pulse" />}
            </div>

            {/* Action buttons based on notification type */}
            {notification.type === 'friend_request' && (
              <div className="flex flex-wrap gap-2 mt-3">
                <Button
                  size="sm"
                  className="bg-red-600 hover:bg-red-700 text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAccept?.(notification);
                  }}
                >
                  <CheckSquare className="w-4 h-4 mr-1" />
                  Accept
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="dark:hover:bg-gray-800/50 hover:bg-gray-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDecline?.(notification);
                  }}
                >
                  <X className="w-4 h-4 mr-1" />
                  Decline
                </Button>
              </div>
            )}

            {notification.type === 'room_invitation' && (
              <div className="flex flex-wrap gap-2 mt-3">
                <Button
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    onJoin?.(notification);
                  }}
                >
                  <Video className="w-4 h-4 mr-1" />
                  Join Room
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="dark:hover:bg-gray-800/50 hover:bg-gray-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDecline?.(notification);
                  }}
                >
                  <X className="w-4 h-4 mr-1" />
                  Decline
                </Button>
              </div>
            )}

            {notification.type === 'friend_joined_room' && (
              <div className="flex flex-wrap gap-2 mt-3">
                <Button
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    onJoin?.(notification);
                  }}
                >
                  <Video className="w-4 h-4 mr-1" />
                  Join Room
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete?.(notification);
                  }}
                >
                  Dismiss
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}