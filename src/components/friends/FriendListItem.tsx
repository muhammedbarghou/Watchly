import { UserMinus, MessageCircle, Video, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Friend } from '@/hooks/use-friends';

interface FriendListItemProps {
  friend: Friend;
  onMessage?: (friendId: string) => void;
  onRemove?: (friendId: string) => void;
  onJoinRoom?: (roomId: string) => void;
  onInviteToRoom?: (friendId: string) => void;
}

export const FriendListItem = ({
  friend,
  onMessage,
  onRemove,
  onJoinRoom,
  onInviteToRoom
}: FriendListItemProps) => {
  const getStatusColor = (status: Friend['status']) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'in-room': return 'bg-blue-500';
      default: return 'bg-gray-400';
    }
  };
  
  const getStatusText = (friend: Friend) => {
    switch (friend.status) {
      case 'online': 
        return 'Online';
      case 'in-room': 
        return `In room: ${friend.roomName || 'Unnamed room'}`;
      case 'offline': 
        return friend.lastSeen
          ? `Last seen ${new Date(friend.lastSeen).toLocaleTimeString()}`
          : 'Offline';
      default:
        return 'Offline';
    }
  };
  
  return (
    <div className="flex items-center justify-between p-4 rounded-lg bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex items-center gap-3">
        <div className="relative">
          <Avatar>
            <AvatarImage
              src={friend.photoURL || undefined}
              alt={friend.displayName}
            />
            <AvatarFallback>
              {friend.displayName?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <div 
            className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ${getStatusColor(friend.status)} ring-2 ring-white dark:ring-gray-800`}
            aria-hidden="true"
          />
        </div>
        
        <div>
          <h3 className="font-medium">{friend.displayName}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {getStatusText(friend)}
          </p>
        </div>
      </div>
      
      <div className="flex gap-2">
        {onMessage && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onMessage(friend.id)}
            title="Message"
          >
            <MessageCircle className="w-4 h-4" />
          </Button>
        )}
        
        {friend.status === 'in-room' && onJoinRoom && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => friend.roomId && onJoinRoom(friend.roomId)}
            className="flex items-center gap-1"
          >
            <Video className="w-4 h-4" />
            <span>Join</span>
          </Button>
        )}
        
        {friend.status === 'online' && onInviteToRoom && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onInviteToRoom(friend.id)}
            className="flex items-center gap-1"
          >
            <UserPlus className="w-4 h-4" />
            <span>Invite</span>
          </Button>
        )}
        
        {onRemove && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onRemove(friend.id)}
            className="text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-500"
            title="Remove friend"
          >
            <UserMinus className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
};