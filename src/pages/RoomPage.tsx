import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { VideoPlayer } from '../components/room/VideoPlayer';
import { ChatPanel } from '../components/room/ChatPanel';

// Define the structure of the room details and 
interface RoomDetails {
  name: string;
  videoUrl: string;
  password: string;
  id: string;
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

  useEffect(() => {
    const storedRoomDetails = localStorage.getItem('roomDetails');
    if (storedRoomDetails) {
      const parsedDetails = JSON.parse(storedRoomDetails);
      if (parsedDetails.id !== roomId) {
        navigate('/error');
        return;
      }
      setRoomDetails(parsedDetails);
    } else {
      navigate('/error');
    }
  }, [roomId, navigate]);

  console.log('Decoded Video URL:', roomDetails?.videoUrl); // Debug the URL

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      username: 'John',
      message: 'Hey everyone!',
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
    },
    {
      id: '2',
      username: 'Sarah',
      message: 'This movie is amazing!',
      timestamp: new Date(Date.now() - 1000 * 60 * 2),
    },
  ]);

  const handleSendMessage = (message: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      username: 'You',
      message,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  return (
    <MainLayout>
      <div className="flex h-[calc(100vh-64px)]">
        <div className="flex-1 flex flex-col h-full">
          <div className="flex-1 bg-black">
            <VideoPlayer url={roomDetails?.videoUrl || ''} />
          </div>
          <div className="p-4 dark:bg-netflix-black">
            <h1 className="text-xl font-bold dark:text-white">
              Room: {roomDetails?.name || 'Unnamed Room'}
            </h1>
            <p className="text-muted-foreground">
              Room Key: {roomDetails?.password || 'No Password'}
            </p>
          </div>
        </div>

        <div className="w-96 h-full dark:bg-netflix-black border-l border-netflix-gray">
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
