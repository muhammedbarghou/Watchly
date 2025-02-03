import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { MainLayout } from '../components/layout/MainLayout';
import { VideoPlayer } from '../components/room/VideoPlayer';
import { ChatPanel } from '../components/room/ChatPanel';
import { Skeleton } from '../components/ui/skeleton';

interface RoomDetails {
  id: string;
  name: string;
  videoUrl: string;
  password?: string;
  createdAt: Date;
}

interface Message {
  id: string;
  username: string;
  message: string;
  timestamp: Date;
}

export function RoomPage() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [roomDetails, setRoomDetails] = useState<RoomDetails | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [passwordAttempt, setPasswordAttempt] = useState('');

  const loadRoomData = useCallback(async () => {
    if (!roomId) {
      navigate('/error');
      return;
    }

    try {
      const roomData = localStorage.getItem(`room-${roomId}`);
      if (!roomData) {
        toast.error('Room not found');
        navigate('/join');
        return;
      }

      const parsedDetails: RoomDetails = JSON.parse(roomData);
      
      // Check password if required
      if (parsedDetails.password && parsedDetails.password !== sessionStorage.getItem(`room-auth-${roomId}`)) {
        const password = prompt('This room requires a password:');
        if (password !== parsedDetails.password) {
          toast.error('Incorrect password');
          navigate('/join');
          return;
        }
        sessionStorage.setItem(`room-auth-${roomId}`, password);
      }

      setRoomDetails(parsedDetails);
      
      // Load chat history
      const savedMessages = localStorage.getItem(`room-chat-${roomId}`);
      if (savedMessages) {
        setMessages(JSON.parse(savedMessages));
      }
    } catch (error) {
      toast.error('Failed to load room data');
      navigate('/');
    } finally {
      setIsLoading(false);
    }
  }, [roomId, navigate]);

  useEffect(() => {
    const abortController = new AbortController();
    loadRoomData();
    return () => abortController.abort();
  }, [loadRoomData]);

  const handleSendMessage = useCallback((message: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      username: 'You', // Replace with actual username from auth
      message,
      timestamp: new Date(),
    };

    setMessages(prev => {
      const updatedMessages = [...prev, newMessage];
      localStorage.setItem(`room-chat-${roomId}`, JSON.stringify(updatedMessages));
      return updatedMessages;
    });
  }, [roomId]);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex h-[calc(100vh-64px)]">
          <Skeleton className="w-full h-full" />
        </div>
      </MainLayout>
    );
  }

  if (!roomDetails) {
    return null;
  }

  return (
    <MainLayout>
      <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)]">
        {/* Video Section */}
        <div className="flex-1 flex flex-col lg:h-full lg:max-w-[calc(100%-24rem)]">
          <div className="relative flex-1 bg-black">
            <div className="absolute inset-0">
              <VideoPlayer 
                url={roomDetails.videoUrl}
                key={roomDetails.videoUrl}
              />
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              <h1 className="text-2xl font-bold text-white">
                {roomDetails.name}
              </h1>
              <p className="text-gray-300">
                Created: {new Date(roomDetails.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Chat Section */}
        <div className="w-full lg:w-96 h-96 lg:h-full border-t lg:border-l lg:border-t-0 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <ChatPanel
            messages={messages}
            onSendMessage={handleSendMessage}
            currentUser="You"
          />
        </div>
      </div>
    </MainLayout>
  );
}