import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  getDoc, 
  setDoc,
  addDoc,
  serverTimestamp,
  updateDoc
} from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, ArrowLeft, Key, Loader2, Lock } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useNotifications } from '@/hooks/use-notifications';

interface Room {
  roomId: string;
  password?: string;
  name: string;
  videoUrl: string;
}

export default function JoinRoomPage() {
  const navigate = useNavigate();
  const { roomId: paramRoomId } = useParams<{ roomId: string }>();
  const location = useLocation();
  const { currentUser } = useAuth();
  const { markAsRead } = useNotifications();
  
  const [roomId, setRoomId] = useState(paramRoomId || '');
  const [password, setPassword] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [isLoading, setIsLoading] = useState(!!paramRoomId);
  const [roomData, setRoomData] = useState<Room | null>(null);
  const [documentId, setDocumentId] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  
  // Get notification data from query params if available
  const queryParams = new URLSearchParams(location.search);
  const notificationId = queryParams.get('notification');
  const source = queryParams.get('source');

  // Fetch room data if room ID is provided in URL
  useEffect(() => {
    const fetchRoomData = async () => {
      if (!paramRoomId || !currentUser) {
        setIsLoading(false);
        return;
      }
      
      try {
        // If coming from a notification, fetch and validate the notification
        if (notificationId) {
          const notificationRef = doc(db, 'users', currentUser.uid, 'notifications', notificationId);
          const notificationDoc = await getDoc(notificationRef);
          
          if (notificationDoc.exists()) {
            const notification = notificationDoc.data();
            
            // Get room document ID from notification
            if (notification.documentId) {
              setDocumentId(notification.documentId);
              
              // Fetch room data
              const roomDoc = await getDoc(doc(db, 'rooms', notification.documentId));
              if (roomDoc.exists()) {
                setRoomData(roomDoc.data() as Room);
                setRoomId(paramRoomId);
                
                // Mark notification as read
                await markAsRead(notificationId);
              } else {
                setError('Room no longer exists');
              }
            }
          } else {
            setError('Invalid invitation');
          }
          
          setIsLoading(false);
        } else {
          // Search for room by roomId
          const roomsRef = collection(db, 'rooms');
          const q = query(roomsRef, where('roomId', '==', paramRoomId));
          const querySnapshot = await getDocs(q);
          
          if (querySnapshot.empty) {
            setError('Room not found');
            setIsLoading(false);
            return;
          }
          
          const roomDoc = querySnapshot.docs[0];
          setRoomData(roomDoc.data() as Room);
          setDocumentId(roomDoc.id);
          setRoomId(paramRoomId);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error fetching room data:', error);
        setError('Failed to load room data');
        setIsLoading(false);
      }
    };
    
    fetchRoomData();
  }, [paramRoomId, currentUser, notificationId, markAsRead]);

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
      // If roomData is already loaded, verify password
      if (roomData && documentId) {
        if (roomData.password && password !== roomData.password) {
          toast.error('Incorrect password');
          setIsJoining(false);
          return;
        }
        
        // Register user in the room
        const userDocRef = doc(db, 'rooms', documentId, 'users', currentUser.uid);
        await setDoc(userDocRef, {
          id: currentUser.uid,
          displayName: currentUser.displayName || 'Anonymous',
          photoURL: currentUser.photoURL,
          isHost: false,
          joinedAt: serverTimestamp(),
          isInVoiceChat: false,
          isMuted: false
        });
        
        // Add system message for user joining
        await addDoc(collection(db, 'rooms', documentId, 'messages'), {
          text: `${currentUser.displayName || 'Anonymous'} joined the room`,
          sender: 'system',
          senderDisplayName: 'System',
          timestamp: serverTimestamp(),
        });

        toast.success(`Joined room: ${roomData.name}`);
        navigate(`/room/${roomId}?source=${source || 'direct'}`, { 
          state: { 
            roomData,
            documentId
          } 
        });
        return;
      }
      
      // If roomData is not loaded, query the database
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
      const fetchedRoomData = roomDoc.data() as Room;
      
      if (fetchedRoomData.password && password !== fetchedRoomData.password) {
        toast.error('Incorrect password');
        setIsJoining(false);
        return;
      }
      
      // Register user in the room
      const userDocRef = doc(db, 'rooms', roomDoc.id, 'users', currentUser.uid);
      await setDoc(userDocRef, {
        id: currentUser.uid,
        displayName: currentUser.displayName || 'Anonymous',
        photoURL: currentUser.photoURL,
        isHost: false,
        joinedAt: serverTimestamp(),
        isInVoiceChat: false,
        isMuted: false
      });
      
      // Add system message for user joining
      await addDoc(collection(db, 'rooms', roomDoc.id, 'messages'), {
        text: `${currentUser.displayName || 'Anonymous'} joined the room`,
        sender: 'system',
        senderDisplayName: 'System',
        timestamp: serverTimestamp(),
      });

      toast.success(`Joined room: ${fetchedRoomData.name}`);
      navigate(`/room/${roomId}?source=manual`, { 
        state: { 
          roomData: fetchedRoomData,
          documentId: roomDoc.id 
        } 
      });
    } catch (error) {
      console.error('Join room error:', error);
      toast.error('Failed to join room. Please try again.');
      setIsJoining(false);
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container flex items-center justify-center min-h-[70vh]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading room information...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="container max-w-md mx-auto py-10 px-4">
          <Card className="border-2 border-destructive/20">
            <CardHeader className="text-center">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-2" />
              <CardTitle className="text-2xl font-bold">Room Error</CardTitle>
              <CardDescription>
                {error}
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button 
                className="w-full"
                onClick={() => navigate('/')}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Return Home
              </Button>
            </CardFooter>
          </Card>
        </div>
      </MainLayout>
    );
  }

  // Show room details if roomData is loaded
  if (roomData && paramRoomId) {
    return (
      <MainLayout>
        <div className="container max-w-md mx-auto py-10 px-4">
          <Card className="border-2 border-primary/10">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold">Join Watch Party</CardTitle>
              <CardDescription>
                You're joining "{roomData.name}"
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                {roomData.password && (
                  <>
                    <div className="flex items-center gap-2 p-3 bg-amber-100 dark:bg-amber-950/30 rounded-md text-amber-800 dark:text-amber-400">
                      <Lock className="h-5 w-5 flex-shrink-0" />
                      <p className="text-sm">This room is password protected</p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="password">Room Password</Label>
                      <div className="relative">
                        <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          id="password"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter room password"
                          disabled={isJoining}
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </>
                )}
              </CardContent>

              <CardFooter className="flex justify-between">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => navigate('/')}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                
                <Button 
                  type="submit" 
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

  // Manual room join form
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