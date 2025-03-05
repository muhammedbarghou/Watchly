import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Key, Lock, Loader2, Users, ArrowRight } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

interface RoomData {
  isPrivate: boolean;
  password?: string;
  name: string;
  participants: Record<string, any>;
  settings: {
    maxParticipants: number;
  };
}

export default function JoinRoomPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [roomKey, setRoomKey] = useState('');
  const [password, setPassword] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [roomPreview, setRoomPreview] = useState<RoomData | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  // Check room existence and get preview data
  const checkRoom = async (key: string) => {
    if (!key.trim()) return;
    
    setIsChecking(true);
    const roomRef = doc(db, 'rooms', key);
    
    try {
      const roomSnap = await getDoc(roomRef);
      if (roomSnap.exists()) {
        setRoomPreview(roomSnap.data() as RoomData);
      } else {
        setRoomPreview(null);
      }
    } catch (error) {
      console.error('Error checking room:', error);
      setRoomPreview(null);
    } finally {
      setIsChecking(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsJoining(true);

    // Check if user is logged in
    if (!currentUser) {
      toast.error('You must be logged in to join a room');
      setIsJoining(false);
      return;
    }

    // Validate room key input
    if (!roomKey.trim()) {
      toast.error('Room key is required');
      setIsJoining(false);
      return;
    }

    // Query Firestore for the room
    const roomRef = doc(db, 'rooms', roomKey);
    try {
      const roomSnap = await getDoc(roomRef);
      if (!roomSnap.exists()) {
        toast.error('Room does not exist');
        setIsJoining(false);
        return;
      }

      const roomData = roomSnap.data() as RoomData;
      
      // Check if room is full
      const participantCount = Object.keys(roomData.participants || {}).length;
      if (participantCount >= roomData.settings.maxParticipants) {
        toast.error('Room is full');
        setIsJoining(false);
        return;
      }

      // Validate password if room is private
      if (roomData.isPrivate) {
        if (!password) {
          toast.error('This room requires a password');
          setIsJoining(false);
          return;
        }
        if (password !== roomData.password) {
          toast.error('Incorrect password');
          setIsJoining(false);
          return;
        }
      }

      // Successfully joined the room
      toast.success('Joined room successfully!');
      navigate(`/room/${roomKey}`);
    } catch (error) {
      console.error('Join room error:', error);
      toast.error('Failed to join room. Please try again.');
      setIsJoining(false);
    }
  };

  return (
    <MainLayout>
      <div className="container max-w-xl mx-auto py-10 px-4">
        <Card className="border-2 border-primary/10">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">Join Watch Party</CardTitle>
            <CardDescription>
              Enter the room key to join an existing watch party
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              {/* Room Key Input */}
              <div className="space-y-2">
                <Label htmlFor="roomKey" className="text-base">Room Key</Label>
                <div className="relative">
                  <Key className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="roomKey"
                    value={roomKey}
                    onChange={(e) => {
                      setRoomKey(e.target.value);
                      checkRoom(e.target.value);
                    }}
                    placeholder="Enter the room key"
                    disabled={isJoining}
                    className="h-12 pl-10"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-base">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter room password (if required)"
                    disabled={isJoining}
                    className="h-12 pl-10"
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Only required for private rooms
                </p>
              </div>

              {/* Room Preview */}
              {roomPreview && (
                <>
                  <Separator />
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Room Preview</h3>
                    
                    <div className="bg-muted p-4 rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Room Name</span>
                        <span className="text-sm">{roomPreview.name}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Access Type</span>
                        <span className="text-sm">
                          {roomPreview.isPrivate ? (
                            <span className="flex items-center gap-1">
                              <Lock className="h-4 w-4" />
                              Private
                            </span>
                          ) : (
                            <span className="text-green-600">Public</span>
                          )}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Participants</span>
                        <span className="text-sm flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {Object.keys(roomPreview.participants || {}).length} / {roomPreview.settings.maxParticipants}
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Room Not Found Alert */}
              {roomKey && !isChecking && !roomPreview && (
                <Alert variant="destructive">
                  <AlertDescription>
                    Room not found. Please check the room key and try again.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>

            <CardFooter className="flex flex-col gap-4 px-6 pb-6">
              <Button 
                type="submit" 
                className="w-full h-12 text-base"
                disabled={isJoining || !roomPreview}
              >
                {isJoining ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Joining Room...
                  </>
                ) : (
                  <>
                    Join Watch Party
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </MainLayout>
  );
}