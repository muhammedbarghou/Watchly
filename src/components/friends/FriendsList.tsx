import { User } from 'lucide-react';
import { Button } from '../ui/button';

interface Friend {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'in-room';
  roomId?: string;
}

export function FriendsList() {
  const friends: Friend[] = [
    { id: '1', name: 'John Doe', status: 'in-room', roomId: 'movie-night' },
    { id: '2', name: 'Jane Smith', status: 'online' },
    { id: '3', name: 'Mike Johnson', status: 'offline' },
  ];

  return (
    <div className="space-y-4">
      {friends.map((friend) => (
        <div
          key={friend.id}
          className="flex items-center justify-between p-4 bg-gray rounded-lg"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-netflix-red flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-medium text-dark dark:textè-white">{friend.name}</h3>
              <p className="text-sm text-gray-400">
                {friend.status === 'in-room' ? `Watching in ${friend.roomId}` : friend.status}
              </p>
            </div>
          </div>
          
          {friend.status === 'in-room' && (
            <Button variant="default">
              Join Room
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}