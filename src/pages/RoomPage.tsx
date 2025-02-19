import { useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { VideoPlayer } from '../components/room/VideoPlayer';
import { ChatPanel } from '../components/room/ChatPanel';
import { useRoom } from '@/hooks/useRoom';

export function RoomPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const { room, loading, error } = useRoom(id);
  
  const [messages, setMessages] = useState([
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
    const newMessage = {
      id: Date.now().toString(),
      username: 'You',
      message,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-full">
          <p className="text-muted-foreground">Loading room data...</p>
        </div>
      </MainLayout>
    );
  }

  if (error || !room) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-full">
          <p className="text-red-500">{error || 'Room not found'}</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="flex h-[calc(100vh-64px)]">
        <div className="flex-1 flex flex-col h-full">
          <div className="flex-1 bg-black">
            <VideoPlayer url={room.videoUrl} />
          </div>
          <div className="p-4 dark:bg-netflix-black">
            <h1 className="text-xl font-bold dark:text-white">{room.name}</h1>
            <p className="text-muted-foreground">Room Key: {room.key}</p>
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