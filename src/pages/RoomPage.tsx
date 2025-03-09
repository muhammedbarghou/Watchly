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
  Timestamp 
} from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/use-auth';

// Import components
import RoomNavbar from '@/components/room/RoomNavbar';
import OptimizedVideoPlayer from '@/components/room/VideoPlayerPanel';
import ParticipantsPanel from '@/components/room/ParticipantsPanel';
import MessageList from '@/components/room/MessageList';
import MessageInput from '@/components/room/MessageInput';

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
  
  // State
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeUsers, setActiveUsers] = useState<RoomUser[]>([]);
  const [documentId, setDocumentId] = useState<string>('');
  const [isHost, setIsHost] = useState<boolean>(false);
  const [showParticipantsPanel, setShowParticipantsPanel] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

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
  };

  // Handle video error
  const handleVideoError = (error: any) => {
    console.error('Video player error:', error);
    toast.error('Error playing video. Please check the URL.');
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

  // Debug info to troubleshoot host status
  console.log('Current user ID:', currentUser?.uid);
  console.log('Current user displayName:', currentUser?.displayName);
  console.log('Room createdBy:', room?.createdBy);
  console.log('Is host:', isHost);

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      {/* Debug Host Status */}
      
      {/* Room navbar */}
      <RoomNavbar
        roomId={room.roomId}
        roomName={room.name}
        hostName={activeUsers.find(user => user.isHost)?.displayName}
        activeUsersCount={activeUsers.length}
        onLeaveRoom={handleLeaveRoom}
        onToggleParticipants={toggleParticipantsPanel}
        participantsPanelOpen={showParticipantsPanel}
      />

      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Participants panel (conditional) */}
        {showParticipantsPanel && (
          <div className="w-64 flex-shrink-0 overflow-hidden border-r">
            <ParticipantsPanel
              roomId={room.roomId}
              documentId={documentId}
              isHost={isHost}
              currentUserId={currentUser?.uid || ''}
              participants={activeUsers}
              onClose={toggleParticipantsPanel}
            />
          </div>
        )}

        {/* Video panel */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          {/* Video player area */}
          <div className="flex-1 md:w-2/3 overflow-hidden flex flex-col">
            <OptimizedVideoPlayer
              videoUrl={room.videoUrl}
              roomId={room.roomId}
              documentId={documentId}
              isHost={isHost}
              initialTime={room.currentTime}
              initialPlaying={room.isPlaying}
              onError={handleVideoError}
              bufferWindow={3} // Add buffer window to prevent excessive syncing (3 seconds)
            />
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