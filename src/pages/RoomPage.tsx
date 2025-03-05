import { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import ReactPlayer from 'react-player';
import { 
  collection, 
  doc, 
  query, 
  where, 
  getDocs, 
  updateDoc, 
  onSnapshot, 
  serverTimestamp, 
  addDoc,
  deleteDoc,
  setDoc,
  Timestamp 
} from 'firebase/firestore';
import { Loader2, Send, Users, Copy, Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
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
  const playerRef = useRef<ReactPlayer>(null);
  
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
  const [volume, setVolume] = useState<number>(1); 
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isHost, setIsHost] = useState<boolean>(false);
  const [seeking, setSeeking] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const syncIntervalRef = useRef<number | null>(null);
  const playerStateChangeRef = useRef<boolean>(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

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
          if (roomData.currentTime !== undefined && playerRef.current) {
            const currentPlayerTime = playerRef.current.getCurrentTime();
            const timeDiff = Math.abs(currentPlayerTime - roomData.currentTime);
            
            // Only seek if difference is more than 2 seconds
            if (timeDiff > 2 && !seeking) {
              playerRef.current.seekTo(roomData.currentTime, 'seconds');
              setCurrentTime(roomData.currentTime);
            }
          }
          
          if (roomData.isPlaying !== undefined) {
            setIsPlaying(roomData.isPlaying);
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
        if (playerRef.current) {
          updateDoc(doc(db, 'rooms', documentId), {
            currentTime: playerRef.current.getCurrentTime(),
            isPlaying: isPlaying,
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
  }, [isHost, isVideoReady, documentId, isPlaying]);

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

  // Toggle play state - now only allowed for host
  const togglePlay = async () => {
    if (!documentId || !isHost) return;
    
    playerStateChangeRef.current = true;
    setIsPlaying(!isPlaying);
    
    try {
      await updateDoc(doc(db, 'rooms', documentId), {
        isPlaying: !isPlaying,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating play state:', error);
    }
  };

  const handleProgress = (state: { played: number; playedSeconds: number; loaded: number; loadedSeconds: number }) => {
    if (!seeking) {
      setCurrentTime(state.playedSeconds);
    }
  };

  const handleDuration = (duration: number) => {
    setDuration(duration || 0);
  };

  const handleReady = () => {
    setIsVideoReady(true);
    console.log("Video ready!");
    
    if (room?.currentTime && playerRef.current) {
      playerRef.current.seekTo(room.currentTime, 'seconds');
    }
  };

  const handleError = (error: any) => {
    console.error("ReactPlayer error:", error);
    toast.error("Error loading video. Check if the URL is valid and accessible.");
  };

  const handleStartSeeking = () => {
    setSeeking(true);
  };

  const handleTimeSeek = (value: number[]) => {
    if (!documentId) return;
    
    const seekTime = value[0];
    setCurrentTime(seekTime);
    
    if (playerRef.current) {
      playerRef.current.seekTo(seekTime, 'seconds');
    }
    
    if (isHost) {
      playerStateChangeRef.current = true;
      
      updateDoc(doc(db, 'rooms', documentId), {
        currentTime: seekTime,
        updatedAt: serverTimestamp(),
      }).catch(error => {
        console.error('Error updating time:', error);
      });
    }
    
    setSeeking(false);
  };

  const handleVolumeChange = (value: number[]) => {
    const volumeValue = value[0] / 100;
    setVolume(volumeValue);
    
    if (volumeValue === 0) {
      setIsMuted(true);
    } else {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

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
                  <ReactPlayer
                    ref={playerRef}
                    url={room.videoUrl}
                    className="react-player"
                    controls={false}
                    width="100%"
                    height="100%"
                    playing={isPlaying}
                    volume={volume}
                    muted={isMuted}
                    onReady={handleReady}
                    onProgress={handleProgress}
                    onDuration={handleDuration}
                    onError={handleError}
                    onPlay={() => {
                      if (!isHost) {
                        if (playerRef.current && !isPlaying) {
                          playerRef.current.seekTo(currentTime);
                          return false; // This doesn't actually prevent play, we need to pause again
                        }
                      } else {
                        setIsPlaying(true);
                      }
                    }}
                    onPause={() => {
                      // Only allow the host to control playback from the player itself
                      if (!isHost) {
                        if (playerRef.current && isPlaying) {
                          setTimeout(() => {
                            if (playerRef.current) playerRef.current.seekTo(currentTime);
                          }, 50);
                          return false;
                        }
                      } else {
                        setIsPlaying(false);
                      }
                    }}
                    config={{
                      youtube: {
                        playerVars: { 
                          disablekb: !isHost ? 1 : 0, // Disable keyboard controls for non-hosts
                          modestbranding: 1,
                          origin: window.location.origin,
                          controls: 0 // Hide YouTube's own controls
                        }
                      },
                      file: {
                        attributes: {
                          controlsList: 'nodownload',
                          disablePictureInPicture: true
                        }
                      }
                    }}
                  />
                  
                  {/* Overlay to prevent non-host users from clicking on video */}
                  {!isHost && (
                    <div 
                      className="absolute inset-0 bg-transparent cursor-not-allowed" 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toast.info("Only the host can control playback");
                      }}
                    />
                  )}
                </div>

                <div className="mt-4 space-y-3">
                  {/* Progress bar */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{formatTime(currentTime)}</span>
                    <Slider
                      value={[currentTime]}
                      min={0}
                      max={duration || 100}
                      step={0.1}
                      onValueChange={value => {
                        setCurrentTime(value[0]);
                        if (isHost) handleStartSeeking();
                      }}
                      onValueCommit={isHost ? handleTimeSeek : () => {}}
                      className={`flex-1 ${!isHost ? "opacity-50 cursor-not-allowed" : ""}`}
                      disabled={!isHost}
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
                        disabled={!isVideoReady || !isHost}
                        className={!isHost ? "opacity-50 cursor-not-allowed" : ""}
                      >
                        {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                      </Button>
                      
                      <div className="flex items-center gap-2 ml-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={toggleMute}
                          disabled={!isVideoReady || !isHost}
                          className={!isHost ? "opacity-50 cursor-not-allowed" : ""}
                        >
                          {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                        </Button>
                        <Slider
                          value={[isMuted ? 0 : volume * 100]}
                          min={0}
                          max={100}
                          step={1}
                          onValueChange={isHost ? handleVolumeChange : () => {}}
                          className={`w-24 ${!isHost ? "opacity-50 cursor-not-allowed" : ""}`}
                          disabled={!isHost}
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
                        <Badge className="bg-green-600 text-white">Host Controls Enabled</Badge>
                      )}
                    </div>
                  </div>

                  {/* Video URL display and debug info */}
                  <div className="mt-2 text-xs text-muted-foreground">
                    <details>
                      <summary className="cursor-pointer">Video Information</summary>
                      <p className="mt-1 break-all">URL: {room.videoUrl}</p>
                      <p className="mt-1">Status: {isVideoReady ? 'Ready' : 'Loading'}</p>
                      <p className="mt-1">Player: ReactPlayer</p>
                      <p className="mt-1">Control Mode: {isHost ? 'Host (Full Control)' : 'Viewer (No Control)'}</p>
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