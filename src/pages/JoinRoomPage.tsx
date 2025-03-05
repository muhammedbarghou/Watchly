import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';

interface Room {
  roomId: string;
  password?: string;
  name: string;
  videoUrl: string;
}

export default function JoinRoomPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [roomId, setRoomId] = useState('');
  const [password, setPassword] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsJoining(true);

    if (!currentUser) {
      toast.error('You must be logged in to join a room');
      setIsJoining(false);
      return;
    }

    if (!roomId.trim()) {
      toast.error('Room ID is required');
      setIsJoining(false);
      return;
    }

    try {
      // Query rooms collection to find room by roomId
      const roomsRef = collection(db, 'rooms');
      const q = query(roomsRef, where('roomId', '==', roomId));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        toast.error('Room does not exist');
        setIsJoining(false);
        return;
      }

      // Get the first matching room (should be unique)
      const roomDoc = querySnapshot.docs[0];
      const roomData = roomDoc.data() as Room;
      
      if (roomData.password && password !== roomData.password) {
        toast.error('Incorrect password');
        setIsJoining(false);
        return;
      }

      toast.success(`Joined room: ${roomData.name}`);
      navigate(`/room/${roomId}`, { 
        state: { 
          roomData,
          documentId: roomDoc.id 
        } 
      });
    } catch (error) {
      console.error('Join room error:', error);
      toast.error('Failed to join room. Please try again.');
      setIsJoining(false);
    }
  };

  return (
    <MainLayout>
      <div className="container max-w-md mx-auto py-10 px-4">
        <Card className="border-2 border-primary/10">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">Join Watch Party</CardTitle>
            <CardDescription>
              Enter room details to join
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="roomId">Room ID</Label>
                <Input
                  id="roomId"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  placeholder="Enter room ID"
                  disabled={isJoining}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password (Optional)</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter room password"
                  disabled={isJoining}
                />
              </div>
            </CardContent>

            <CardFooter>
              <Button 
                type="submit" 
                className="w-full"
                disabled={isJoining}
              >
                {isJoining ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Joining...
                  </>
                ) : (
                  'Join Room'
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </MainLayout>
  );
}