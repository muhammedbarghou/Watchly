import React from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { VideoPlayer } from '../components/room/VideoPlayer';
import { ChatPanel } from '../components/room/ChatPanel';

interface LocationState {
  name?: string;
  videoUrl?: string;
}

export function RoomPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const { name, videoUrl } = (location.state as LocationState) || {};
  const [messages, setMessages] = React.useState([
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

  return (
    <MainLayout>
      <div className="flex gap-4">
        <div className="flex-1">
          <VideoPlayer url={videoUrl || "https://www.youtube.com/watch?v=dQw4w9WgXcQ"} />
          <div className="mt-4">
            <h1 className="text-xl font-bold">{name || "Movie Night"}</h1>
            <p className="text-muted-foreground">Room ID: {id}</p>
          </div>
        </div>
        
        <div className="w-80">
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