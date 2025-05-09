import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { 
  collection, 
  doc, 
  query, 
  where, 
  getDocs, 
  onSnapshot, 
  serverTimestamp, 
  addDoc,
  deleteDoc,
  setDoc,
  updateDoc,
  Timestamp,
  arrayUnion
} from 'firebase/firestore';
import { Loader2, UserPlus } from 'lucide-react';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/use-auth';
import { useFriends } from '@/hooks/use-friends';
import { useNotifications } from '@/hooks/use-notifications';

// Import components
import RoomNavbar from '@/components/room/RoomNavbar';
import OptimizedVideoPlayer from '@/components/room/VideoPlayerPanel';
import ParticipantsPanel from '@/components/room/ParticipantsPanel';
import MessageList from '@/components/room/MessageList';
import MessageInput from '@/components/room/MessageInput';
import VoiceChat from '@/components/room/VoiceChat';
import { InviteFriends } from '@/components/room/InviteFriends';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';

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
  isInVoiceChat?: boolean;
  isMuted?: boolean;
}

interface VideoQueueItem {
  videoUrl: string;
  addedBy: string;
  addedAt: Timestamp | null;
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
  voiceChatEnabled?: boolean;
  videoQueue?: VideoQueueItem[];
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
  const { friends } = useFriends();
  const { sendRoomInvitation } = useNotifications();
  
  // State
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeUsers, setActiveUsers] = useState<RoomUser[]>([]);
  const [documentId, setDocumentId] = useState<string>('');
  const [isHost, setIsHost] = useState<boolean>(false);
  const [showParticipantsPanel, setShowParticipantsPanel] = useState<boolean>(false);
  const [showVoiceChatPanel, setShowVoiceChatPanel] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [videoQueue, setVideoQueue] = useState<VideoQueueItem[]>([]);
  const [showInviteDialog, setShowInviteDialog] = useState<boolean>(false);
  const [notifiedFriends, setNotifiedFriends] = useState<boolean>(false);

  // Debug log for friends data
  useEffect(() => {
    console.log("Friends data available:", friends.length > 0 ? "Yes" : "No", friends.length);
  }, [friends]);

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
          setIsHost(state.roomData.createdBy === currentUser.uid || state.roomData.createdBy === currentUser.displayName);
          setVideoQueue(state.roomData.videoQueue || []);
          setLoading(false);
        } else if (roomId) {
          // Otherwise query Firebase for the room
          const roomsRef = collection(db, 'rooms');
          const q = query(roomsRef, where('roomId', '==', roomId));
          const querySnapshot = await getDocs(q);

          if (querySnapshot.empty) {
            setError('Room not found');
            setLoading(false);
            return;
          }

          const roomDoc = querySnapshot.docs[0];
          const roomData = roomDoc.data() as Room;
          setRoom(roomData);
          setDocumentId(roomDoc.id);
          setIsHost(roomData.createdBy === currentUser.uid || roomData.createdBy === currentUser.displayName);
          setVideoQueue(roomData.videoQueue || []);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error loading room:', error);
        setError('Failed to load room');
        setLoading(false);
      }
    };

    loadRoom();
  }, [roomId, currentUser, navigate, location]);

  // Subscribe to room data changes
  useEffect(() => {
    if (!documentId) return;

    const roomRef = doc(db, 'rooms', documentId);
    const unsubscribeRoom = onSnapshot(roomRef, (snapshot) => {
      if (snapshot.exists()) {
        const roomData = snapshot.data() as Room;
        setRoom(roomData);
        setVideoQueue(roomData.videoQueue || []);
      }
    });

    return () => {
      unsubscribeRoom();
    };
  }, [documentId]);

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
      } catch (error) {
        console.error('Error registering user:', error);
      }
    };

    registerUser();

    // Cleanup function
    return () => {
      unsubscribeMessages();
      unsubscribeUsers();
      
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

  // Effect for notifying friends when joining a room
  useEffect(() => {
    const notifyFriendsOfJoin = async () => {
      // Only run if we haven't notified yet, have room data, friends data, and are not from an invitation
      if (notifiedFriends || !room || !roomId || !currentUser || friends.length === 0) {
        return;
      }

      // Check join source from URL params
      const params = new URLSearchParams(location.search);
      const source = params.get('source');
      
      // Only notify on fresh joins, not from invitations
      if (source === 'invitation') {
        return;
      }
      
      try {
        console.log("Notifying friends about joining room:", room.name);
        const friendIds = friends.map(f => f.id);
        
        if (friendIds.length > 0) {
          // Get sendRoomInvitation from useNotifications
          await Promise.all(friendIds.map(friendId => 
            addDoc(collection(db, 'users', friendId, 'notifications'), {
              type: 'friend_joined_room',
              roomId: roomId,
              roomName: room.name,
              documentId: documentId,
              senderId: currentUser.uid,
              senderName: currentUser.displayName,
              timestamp: serverTimestamp(),
              message: `joined a watch room called "${room.name}"`,
              read: false
            })
          ));
          
          setNotifiedFriends(true);
          console.log("Successfully notified friends about room join");
        }
      } catch (error) {
        console.error("Error notifying friends:", error);
      }
    };
    
    notifyFriendsOfJoin();
  }, [room, roomId, documentId, currentUser, friends, location.search, notifiedFriends]);

  // Initialize video queue if not present
  useEffect(() => {
    const initVideoQueue = async () => {
      if (!documentId || !isHost || !room) return;
      
      // Only initialize if this is a new room without videoQueue
      if (room.videoQueue === undefined) {
        try {
          await updateDoc(doc(db, 'rooms', documentId), {
            videoQueue: [],
            updatedAt: serverTimestamp(),
          });
        } catch (error) {
          console.error('Error initializing video queue:', error);
        }
      }
    };
    
    initVideoQueue();
  }, [documentId, isHost, room]);

  // Initialize voice chat if new room
  useEffect(() => {
    const initVoiceChat = async () => {
      if (!documentId || !isHost || !room) return;
      
      // Only initialize if this is a new room without voiceChatEnabled flag
      if (room.voiceChatEnabled === undefined) {
        try {
          await updateDoc(doc(db, 'rooms', documentId), {
            voiceChatEnabled: false,
            updatedAt: serverTimestamp(),
          });
        } catch (error) {
          console.error('Error initializing voice chat:', error);
        }
      }
    };
    
    initVoiceChat();
  }, [documentId, isHost, room]);

  // Handle setting next video
  const handleSetNextVideo = async (videoUrl: string, playImmediately: boolean) => {
    if (!documentId || !currentUser || !room) {
      throw new Error('Room data not available');
    }

    try {
      const roomRef = doc(db, 'rooms', documentId);

      if (playImmediately) {
        // Update the current video URL and reset playback state
        await updateDoc(roomRef, {
          videoUrl: videoUrl,
          currentTime: 0,
          isPlaying: true,
          updatedAt: serverTimestamp(),
        });

        // Add system message
        await addDoc(collection(db, 'rooms', documentId, 'messages'), {
          text: `${currentUser.displayName || 'Anonymous'} changed the video to a new one`,
          sender: 'system',
          senderDisplayName: 'System',
          timestamp: serverTimestamp(),
        });
      } else {
        // Add to queue
        const newQueueItem: VideoQueueItem = {
          videoUrl: videoUrl,
          addedBy: currentUser.displayName || 'Anonymous',
          addedAt: Timestamp.now(),
        };

        await updateDoc(roomRef, {
          videoQueue: arrayUnion(newQueueItem),
          updatedAt: serverTimestamp(),
        });

        // Add system message
        await addDoc(collection(db, 'rooms', documentId, 'messages'), {
          text: `${currentUser.displayName || 'Anonymous'} added a video to the queue`,
          sender: 'system',
          senderDisplayName: 'System',
          timestamp: serverTimestamp(),
        });
      }
    } catch (error) {
      console.error('Error setting next video:', error);
      throw new Error('Failed to set next video');
    }
  };

  // Handle sending room invitation to a friend
  const handleInviteFriend = async (friendId: string) => {
    if (!room || !roomId || !documentId || !currentUser) {
      toast.error('Room information not available');
      return false;
    }
    
    try {
      const success = await sendRoomInvitation(
        friendId,
        roomId,
        room.name,
        documentId
      );
      
      if (success) {
        toast.success('Invitation sent!');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error inviting friend:', error);
      toast.error('Failed to send invitation');
      return false;
    }
  };

  // Handle leaving the room
  const handleLeaveRoom = async () => {
    try {
      if (currentUser && documentId) {
        const userDocRef = doc(db, 'rooms', documentId, 'users', currentUser.uid);
        await deleteDoc(userDocRef);
        
        // Add system message
        await addDoc(collection(db, 'rooms', documentId, 'messages'), {
          text: `${currentUser.displayName || 'Anonymous'} left the room`,
          sender: 'system',
          senderDisplayName: 'System',
          timestamp: serverTimestamp(),
        });
      }
      
      navigate('/');
    } catch (error) {
      console.error('Error leaving room:', error);
      toast.error('Failed to leave room');
    }
  };

  // Toggle participants panel
  const toggleParticipantsPanel = () => {
    setShowParticipantsPanel(!showParticipantsPanel);
    
    // Close voice chat panel if opening participants panel
    if (!showParticipantsPanel) {
      setShowVoiceChatPanel(false);
    }
  };

  // Toggle voice chat panel
  const toggleVoiceChatPanel = () => {
    setShowVoiceChatPanel(!showVoiceChatPanel);
    
    // Close participants panel if opening voice chat panel
    if (!showVoiceChatPanel) {
      setShowParticipantsPanel(false);
    }
  };

  // Toggle invite dialog
  const toggleInviteDialog = () => {
    setShowInviteDialog(!showInviteDialog);
  };

  // Handle video error
  const handleVideoError = (error: any) => {
    console.error('Video player error:', error);
    toast.error('Error playing video. Please check the URL.');
  };

  // Handle video ended - play next from queue if available
  const handleVideoEnded = async () => {
    if (!isHost || !documentId || !room || videoQueue.length === 0) return;

    try {
      const nextVideo = videoQueue[0];
      const updatedQueue = videoQueue.slice(1); // Remove the first item
      
      // Update the current video URL and reset playback state
      await updateDoc(doc(db, 'rooms', documentId), {
        videoUrl: nextVideo.videoUrl,
        videoQueue: updatedQueue,
        currentTime: 0,
        isPlaying: true,
        updatedAt: serverTimestamp(),
      });

      // Add system message
      await addDoc(collection(db, 'rooms', documentId, 'messages'), {
        text: `Now playing next video from queue (added by ${nextVideo.addedBy})`,
        sender: 'system',
        senderDisplayName: 'System',
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error playing next video:', error);
      toast.error('Failed to play next video from queue');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col h-screen">
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin mr-2" />
          <span>Loading room...</span>
        </div>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="flex flex-col h-screen">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">{error || 'Room not found'}</h2>
            <p className="mb-4">The room you're looking for doesn't exist or has been closed.</p>
            <button
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
              onClick={() => navigate('/')}
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      {/* Room navbar */}
      <RoomNavbar
        roomId={room.roomId}
        roomName={room.name}
        hostName={activeUsers.find(user => user.isHost)?.displayName}
        activeUsersCount={activeUsers.length}
        onLeaveRoom={handleLeaveRoom}
        onToggleParticipants={toggleParticipantsPanel}
        participantsPanelOpen={showParticipantsPanel}
        onToggleVoiceChat={toggleVoiceChatPanel}
        voiceChatPanelOpen={showVoiceChatPanel}
        voiceChatEnabled={room.voiceChatEnabled}
        voiceChatActiveUsers={activeUsers.filter(user => user.isInVoiceChat).length}
        isHost={isHost}
        onSetNextVideo={handleSetNextVideo}
        onToggleInvite={toggleInviteDialog}
      />

      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Panels (conditional) */}
        {(showParticipantsPanel || showVoiceChatPanel) && (
          <div className="w-64 flex-shrink-0 overflow-hidden border-r">
            {showParticipantsPanel && (
              <ParticipantsPanel
                roomId={room.roomId}
                documentId={documentId}
                isHost={isHost}
                currentUserId={currentUser?.uid || ''}
                participants={activeUsers}
                onClose={toggleParticipantsPanel}
              />
            )}
            
            {showVoiceChatPanel && currentUser && (
              <div className="h-full p-4 overflow-y-auto">
                <VoiceChat
                  roomId={room.roomId}
                  documentId={documentId}
                  currentUserId={currentUser.uid}
                  currentUserDisplayName={currentUser.displayName || 'Anonymous'}
                  participants={activeUsers}
                  isHost={isHost}
                />
              </div>
            )}
          </div>
        )}

        {/* Video panel */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          {/* Video player area */}
          <div className="flex-1 md:w-2/3 overflow-hidden flex flex-col">
            <div className="relative w-full h-full">
              <OptimizedVideoPlayer
                videoUrl={room.videoUrl}
                roomId={room.roomId}
                documentId={documentId}
                isHost={isHost}
                initialTime={room.currentTime}
                initialPlaying={room.isPlaying}
                onError={handleVideoError}
                onEnded={handleVideoEnded}
                bufferWindow={3} // Add buffer window to prevent excessive syncing (3 seconds)
                queueCount={videoQueue.length}
              />
              
              {/* Invite button overlay */}
              <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
                <DialogTrigger asChild>
                  <Button 
                    className="absolute top-4 right-4 z-10"
                    variant="outline"
                    size="sm"
                  >
                    <UserPlus className="h-4 w-4 mr-2" /> 
                    Invite Friends
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <InviteFriends
                    roomId={room.roomId}
                    roomName={room.name}
                    documentId={documentId}
                    onInvite={handleInviteFriend}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Chat area */}
          <div className="md:w-1/3 h-64 md:h-auto overflow-hidden flex flex-col border-t md:border-t-0 md:border-l">
            <div className="flex-1 overflow-hidden flex flex-col">
              <div className="flex-1 overflow-hidden">
                <MessageList
                  messages={messages}
                  currentUserId={currentUser?.uid || ''}
                  activeUsers={activeUsers}
                  isLoading={false}
                />
              </div>
              <div className="flex-shrink-0">
                <MessageInput
                  roomId={room.roomId}
                  documentId={documentId}
                  currentUser={currentUser}
                  placeholder="Type a message..."
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RoomPage;