import { UserPlus, Video } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface NotificationItemProps {
  title: string;
  message: string;
  time: string;
  type: 'invite' | 'friend';
  user: {
    name: string;
    image: string;
  };
  isRead: boolean;
  onAccept?: () => void;
  onDecline?: () => void;
}

export function NotificationItem({ 
  message, 
  time, 
  type, 
  user,
  isRead,
  onAccept,
  onDecline
}: NotificationItemProps) {
  const Icon = type === 'invite' ? Video : UserPlus;

  return (
    <div className={`px-4 py-3 hover:bg-gray-950 cursor-pointer transition-colors ${
      !isRead ? 'bg-gray-900/30' : ''
    }`}>
      <div className="flex items-start gap-3">
        <div className="relative">
          <Avatar className="h-12 w-12">
            <AvatarImage src={user.image} alt={user.name} />
            <AvatarFallback className="bg-gray-800 text-gray-200">
              {user.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div className="absolute bottom-0 right-0 rounded-full bg-gray-900 p-1">
            <Icon className={`w-4 h-4 ${
              type === 'invite' ? 'text-netflix-red' : 'text-red-500'
            }`} />
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start gap-2">
            <div>
              <p className="text-sm text-gray-200">
                <span className="font-medium">{user.name}</span>{' '}
                <span className="text-gray-400">{message}</span>
              </p>
              <p className="text-xs text-gray-500 mt-1">{time}</p>
            </div>
            {!isRead && (
              <div className="w-2 h-2 rounded-full bg-netflix-red mt-1 flex-shrink-0" />
            )}
          </div>

          {/* Actions for friend requests */}
          {type === 'friend' && (
            <div className="flex gap-2 mt-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={(e) => {
                  e.stopPropagation(); // Prevent triggering the parent onClick
                  onAccept?.();
                }}
              >
                Accept
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={(e) => {
                  e.stopPropagation(); // Prevent triggering the parent onClick
                  onDecline?.();
                }}
              >
                Decline
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}