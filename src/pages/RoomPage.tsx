import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { VideoPlayer } from '../components/room/VideoPlayer';
import { ChatPanel } from '../components/room/ChatPanel';
import { useAppSelector } from '@/hooks/use-room';
import { RootState } from '@/store/Store';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export function RoomPage() {
  const { id } = useParams<{ id: string }>();

  const room = useAppSelector((state: RootState) =>
    state.room.rooms.find((room) => room.id === id)
  );

  const [roomKey, setRoomKey] = useState<string | null>(null);

  useEffect(() => {
    const fetchRoomKey = async () => {
      if (id) {
        const roomDoc = await getDoc(doc(db, 'rooms', id));
        if (roomDoc.exists()) {
          setRoomKey(roomDoc.data().key); // Set the room key
        } else {
          console.error('Room document not found in Firestore.');
        }
      }
    };

    fetchRoomKey();
  }, [id]);

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

  // If the room is not found, display a loading or error message
  if (!room) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-full">
          <p className="text-muted-foreground">Room not found or loading...</p>
        </div>
      </MainLayout>
    );
  }

  return (
      <div className="flex">
        <div className="flex-1">
          {/* Use the room's video URL */}
          <VideoPlayer url={room.videoUrl} />
          <div className="mt-4">
            {/* Use the room's name */}
            <h1 className="text-xl font-bold">{room.name}</h1>
            {/* Display the room's key */}
            <p className="text-muted-foreground">Room Key: {roomKey || 'Loading...'}</p>
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
  );
}