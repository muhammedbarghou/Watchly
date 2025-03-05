import { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { 
  collection, 
  doc, 
  getDoc, 
  query, 
  where, 
  getDocs, 
  updateDoc, 
  onSnapshot, 
  arrayUnion, 
  serverTimestamp, 
  addDoc,
  deleteDoc,
  setDoc,
  DocumentData,
  Timestamp 
} from 'firebase/firestore';
import { Loader2, Send, Users, Copy, Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import MainLayout from '@/components/layout/MainLayout';

// Interfaces
interface Message {
  id: string;
  text: string;
  sender: string;
  senderDisplayName: string;
  senderPhotoURL?: string;
  timestamp: Timestamp | null;
}

interface RoomUser {
  id: string;
  displayName: string;
  photoURL?: string;
  isHost: boolean;
  joinedAt: Timestamp | null;
}

interface Room {
  roomId: string;
  name: string;
  videoUrl: string;
  createdBy: string;
  password?: string;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
  currentTime?: number;
  isPlaying?: boolean;
}

interface LocationState {
  roomData: Room;
  documentId: string;
}

export function RoomPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // State
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');
  const [activeUsers, setActiveUsers] = useState<RoomUser[]>([]);
  const [documentId, setDocumentId] = useState<string>('');
  const [isVideoReady, setIsVideoReady] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(100);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isHost, setIsHost] = useState<boolean>(false);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const syncIntervalRef = useRef<number | null>(null);
  const playerStateChangeRef = useRef<boolean>(false);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Format time (seconds) to MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Load room data
  useEffect(() => {
    const loadRoom = async () => {
      if (!currentUser) {
        toast.error('Please login to join a room');
        navigate('/login');
        return;
      }

      try {
        // If we have roomData from navigation state, use it
        const state = location.state as LocationState | null;
        
        if (state?.roomData && state?.documentId) {
          setRoom(state.roomData);
          setDocumentId(state.documentId);
          setIsHost(state.roomData.createdBy === currentUser.displayName);
          setLoading(false);
        } else if (roomId) {
          // Otherwise query Firebase for the room
          const roomsRef = collection(db, 'rooms');
          const q = query(roomsRef, where('roomId', '==', roomId));
          const querySnapshot = await getDocs(q);

          if (querySnapshot.empty) {
            toast.error('Room not found');
            navigate('/');
            return;
          }

          const roomDoc = querySnapshot.docs[0];
          const roomData = roomDoc.data() as Room;
          setRoom(roomData);
          setDocumentId(roomDoc.id);
          setIsHost(roomData.createdBy === currentUser.displayName);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error loading room:', error);
        toast.error('Failed to load room');
        navigate('/');
      }
    };

    loadRoom();
  }, [roomId, currentUser, navigate, location]);

  // Setup listeners for messages and users
  useEffect(() => {
    if (!documentId || !currentUser) return;

    // Subscribe to messages
    const messagesRef = collection(db, 'rooms', documentId, 'messages');
    const messagesQuery = query(messagesRef);
    
    const unsubscribeMessages = onSnapshot(messagesQuery, (snapshot) => {
      const messagesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Message[];
      
      // Sort messages by timestamp
      const sortedMessages = messagesData.sort((a, b) => {
        if (!a.timestamp) return -1;
        if (!b.timestamp) return 1;
        return a.timestamp.toMillis() - b.timestamp.toMillis();
      });
      
      setMessages(sortedMessages);
      scrollToBottom();
    });

    // Subscribe to active users
    const usersRef = collection(db, 'rooms', documentId, 'users');
    const usersQuery = query(usersRef);
    
    const unsubscribeUsers = onSnapshot(usersQuery, (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as RoomUser[];
      
      setActiveUsers(usersData);
    });

    // Subscribe to room updates (video state)
    const roomRef = doc(db, 'rooms', documentId);
    
    const unsubscribeRoom = onSnapshot(roomRef, (snapshot) => {
      if (snapshot.exists()) {
        const roomData = snapshot.data() as Room;
        
        // Only update if not from local change
        if (!playerStateChangeRef.current) {
          if (roomData.currentTime !== undefined && videoRef.current) {
            const timeDiff = Math.abs(videoRef.current.currentTime - roomData.currentTime);
            
            // Only seek if difference is more than 2 seconds
            if (timeDiff > 2) {
              videoRef.current.currentTime = roomData.currentTime;
            }
          }
          
          if (roomData.isPlaying !== undefined) {
            setIsPlaying(roomData.isPlaying);
            if (roomData.isPlaying && videoRef.current) {
              videoRef.current.play().catch(error => console.error('Play error:', error));
            } else if (!roomData.isPlaying && videoRef.current) {
              videoRef.current.pause();
            }
          }
        }
        
        // Reset flag
        playerStateChangeRef.current = false;
      }
    });

    // Register user in the room
    const registerUser = async () => {
      if (!currentUser) return;
      
      try {
        const userDocRef = doc(db, 'rooms', documentId, 'users', currentUser.uid);
        await setDoc(userDocRef, {
          id: currentUser.uid,
          displayName: currentUser.displayName || 'Anonymous',
          photoURL: currentUser.photoURL,
          isHost: isHost,
          joinedAt: serverTimestamp(),
        });

        // Add system message for user joining
        await addDoc(collection(db, 'rooms', documentId, 'messages'), {
          text: `${currentUser.displayName || 'Anonymous'} joined the room`,
          sender: 'system',
          senderDisplayName: 'System',
          timestamp: serverTimestamp(),
        });
      } catch (error) {
        console.error('Error registering user:', error);
      }
    };

    registerUser();

    // Cleanup function
    return () => {
      unsubscribeMessages();
      unsubscribeUsers();
      unsubscribeRoom();
      
      // Remove user when leaving
      if (currentUser) {
        const userDocRef = doc(db, 'rooms', documentId, 'users', currentUser.uid);
        deleteDoc(userDocRef).catch(error => {
          console.error('Error removing user:', error);
        });

        // Add system message for user leaving
        addDoc(collection(db, 'rooms', documentId, 'messages'), {
          text: `${currentUser.displayName || 'Anonymous'} left the room`,
          sender: 'system',
          senderDisplayName: 'System',
          timestamp: serverTimestamp(),
        }).catch(error => {
          console.error('Error adding leave message:', error);
        });
      }
    };
  }, [documentId, currentUser, isHost]);

  // Sync video state periodically if host
  useEffect(() => {
    if (isHost && isVideoReady && documentId) {
      syncIntervalRef.current = window.setInterval(() => {
        if (videoRef.current) {
          updateDoc(doc(db, 'rooms', documentId), {
            currentTime: videoRef.current.currentTime,
            isPlaying: !videoRef.current.paused,
            updatedAt: serverTimestamp(),
          }).catch(error => {
            console.error('Error syncing video state:', error);
          });
        }
      }, 5000); // Sync every 5 seconds
    }

    return () => {
      if (syncIntervalRef.current) {
        window.clearInterval(syncIntervalRef.current);
      }
    };
  }, [isHost, isVideoReady, documentId]);

  // Send a chat message
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !currentUser || !documentId) return;
    
    try {
      await addDoc(collection(db, 'rooms', documentId, 'messages'), {
        text: newMessage.trim(),
        sender: currentUser.uid,
        senderDisplayName: currentUser.displayName || 'Anonymous',
        senderPhotoURL: currentUser.photoURL,
        timestamp: serverTimestamp(),
      });
      
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  // Handle video controls
  const togglePlay = async () => {
    if (!videoRef.current || !documentId) return;
    
    playerStateChangeRef.current = true;
    
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      try {
        await videoRef.current.play();
        setIsPlaying(true);
      } catch (error) {
        console.error('Error playing video:', error);
        toast.error('Failed to play video. Check if the URL is valid.');
        setIsPlaying(false);
      }
    }
    
    if (isHost) {
      try {
        await updateDoc(doc(db, 'rooms', documentId), {
          isPlaying: !isPlaying,
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        console.error('Error updating play state:', error);
      }
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime);
  };

  const handleDurationChange = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration || 0);
  };

  const handleTimeSeek = (value: number[]) => {
    if (!videoRef.current || !documentId) return;
    
    videoRef.current.currentTime = value[0];
    setCurrentTime(value[0]);
    
    if (isHost) {
      playerStateChangeRef.current = true;
      
      updateDoc(doc(db, 'rooms', documentId), {
        currentTime: value[0],
        updatedAt: serverTimestamp(),
      }).catch(error => {
        console.error('Error updating time:', error);
      });
    }
  };

  const handleVolumeChange = (value: number[]) => {
    if (!videoRef.current) return;
    
    const volumeValue = value[0];
    setVolume(volumeValue);
    videoRef.current.volume = volumeValue / 100;
    
    if (volumeValue === 0) {
      setIsMuted(true);
    } else {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    
    if (isMuted) {
      videoRef.current.volume = volume / 100;
      setIsMuted(false);
    } else {
      videoRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  // Copy room ID to clipboard
  const copyRoomId = () => {
    if (roomId) {
      navigator.clipboard.writeText(roomId);
      toast.success('Room ID copied to clipboard');
    }
  };
  
  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[70vh]">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading room...</span>
        </div>
      </MainLayout>
    );
  }

  if (!room) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[70vh]">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Room not found</h2>
            <p className="mb-4">The room you're looking for doesn't exist or has been closed.</p>
            <Button onClick={() => navigate('/')}>Go Home</Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container px-4 py-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Video and Controls Section */}
          <div className="flex flex-col w-full md:w-3/4">
            <Card className="border-2 border-primary/10">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl">{room.name}</CardTitle>
                    <CardDescription>
                      Host: {room.createdBy}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{activeUsers.length}</span>
                    </div>
                    <Button variant="outline" size="sm" onClick={copyRoomId}>
                      <Copy className="h-4 w-4 mr-1" />
                      {roomId}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="relative aspect-video bg-black rounded-md overflow-hidden">
                  {/* Use video element with poster for better compatibility */}
                  <video
                    ref={videoRef}
                    className="w-full h-full"
                    src={room.videoUrl}
                    onTimeUpdate={handleTimeUpdate}
                    onDurationChange={handleDurationChange}
                    onLoadedData={() => setIsVideoReady(true)}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onError={(e) => {
                      console.error("Video error:", e);
                      toast.error("Error loading video. Check if the URL is valid and accessible.");
                    }}
                    controls={false}
                    playsInline
                    poster="/video-placeholder.jpg"
                  />
                </div>

                <div className="mt-4 space-y-3">
                  {/* Progress bar */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{formatTime(currentTime)}</span>
                    <Slider
                      value={[currentTime]}
                      min={0}
                      max={duration || 100}
                      step={1}
                      onValueChange={handleTimeSeek}
                      className="flex-1"
                    />
                    <span className="text-sm">{formatTime(duration)}</span>
                  </div>
                  
                  {/* Controls */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={togglePlay}
                        disabled={!isVideoReady}
                      >
                        {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                      </Button>
                      
                      <div className="flex items-center gap-2 ml-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={toggleMute}
                          disabled={!isVideoReady}
                        >
                          {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                        </Button>
                        <Slider
                          value={[isMuted ? 0 : volume]}
                          min={0}
                          max={100}
                          step={1}
                          onValueChange={handleVolumeChange}
                          className="w-24"
                        />
                      </div>
                    </div>
                    
                    <div>
                      {!isHost && (
                        <Badge variant="outline" className="ml-auto">
                          {isPlaying ? 'Playing' : 'Paused'}
                        </Badge>
                      )}
                      {isHost && (
                        <Badge className="bg-green-600 text-white">Host</Badge>
                      )}
                    </div>
                  </div>

                  {/* Video URL display and debug info */}
                  <div className="mt-2 text-xs text-muted-foreground">
                    <details>
                      <summary className="cursor-pointer">Video Information</summary>
                      <p className="mt-1 break-all">URL: {room.videoUrl}</p>
                      <p className="mt-1">Status: {isVideoReady ? 'Ready' : 'Loading'}</p>
                    </details>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chat Section */}
          <div className="w-full md:w-1/4">
            <Card className="h-full border-2 border-primary/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Chat</CardTitle>
                <CardDescription>
                  {activeUsers.length} {activeUsers.length === 1 ? 'person' : 'people'} in the room
                </CardDescription>
                <Separator />
              </CardHeader>
              <CardContent className="p-0">
                <div className="flex flex-col h-[calc(70vh-160px)]">
                  <ScrollArea className="flex-1 px-4">
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div key={message.id} className="flex items-start gap-2">
                          {message.sender !== 'system' ? (
                            <>
                              <Avatar className="h-8 w-8">
                                {message.senderPhotoURL && (
                                  <AvatarImage src={message.senderPhotoURL} alt="User" />
                                )}
                                <AvatarFallback>
                                  {message.senderDisplayName?.charAt(0) || 'U'}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium">
                                    {message.senderDisplayName}
                                  </span>
                                  {activeUsers.find(user => user.id === message.sender)?.isHost && (
                                    <Badge variant="outline" className="text-xs py-0">Host</Badge>
                                  )}
                                </div>
                                <p className="text-sm mt-1">{message.text}</p>
                              </div>
                            </>
                          ) : (
                            <div className="w-full">
                              <p className="text-xs text-center text-muted-foreground italic">
                                {message.text}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>
                  
                  <form onSubmit={sendMessage} className="p-4 border-t">
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                      />
                      <Button type="submit" size="icon" disabled={!newMessage.trim()}>
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </form>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default RoomPage;