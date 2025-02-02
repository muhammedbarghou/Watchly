import { User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { MainLayout } from '@/components/layout/MainLayout';

interface Friend {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'in-room';
  roomId?: string;
}

export default function FriendsPage() {
  const friends: Friend[] = [
    { id: '1', name: 'John Doe', status: 'in-room', roomId: 'movie-night' },
    { id: '2', name: 'Jane Smith', status: 'online' },
    { id: '3', name: 'Mike Johnson', status: 'offline' },
  ];

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold mb-6">Friends List</h1>
        <ScrollArea className="h-[500px] w-full rounded-lg border p-4">
          <div className="space-y-4">
            {friends.map((friend) => (
              <Card key={friend.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-netflix-red flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-medium text-dark dark:text-white">{friend.name}</h3>
                      <p className="text-sm text-gray-400">
                        {friend.status === 'in-room' ? `Watching in ${friend.roomId}` : friend.status}
                      </p>
                    </div>
                  </div>
                  {friend.status === 'in-room' && (
                    <Button variant="default">Join Room</Button>
                  )}
                </CardContent>
                <Separator />
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>
    </MainLayout>
  );
}
