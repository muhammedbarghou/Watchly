import { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { VideoPlayer } from '../components/room/VideoPlayer';
import { ChatPanel } from '../components/room/ChatPanel';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export function RoomPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const { videoUrl: urlFromState } = location.state || { videoUrl: '' }; // Get video URL from state



  const [roomKey, setRoomKey] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>(urlFromState || ''); // Use video URL from state or Firestore
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRoomData = async () => {
      if (id) {
        try {
          const roomDoc = await getDoc(doc(db, 'rooms', id));
          if (roomDoc.exists()) {
            const roomData = roomDoc.data();
            console.log('Room data fetched:', roomData); // Debugging log
            setRoomKey(roomData.key || 'No key available'); // Set the room key with fallback
            setVideoUrl(roomData.videoUrl || urlFromState || ''); // Use Firestore video URL or fallback to state
          } else {
            setError('Room document not found in Firestore.');
          }
        } catch (err) {
          setError('Failed to fetch room data.');
          console.error('Error fetching room data:', err);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchRoomData();
  }, [id, urlFromState]);

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

  if (error) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-full">
          <p className="text-red-500">{error}</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="flex h-[calc(100vh-64px)]"> {/* Subtract the height of the header (64px) */}
        {/* Video Player Section */}
        <div className="flex-1 flex flex-col h-full">
          <div className="flex-1 bg-black">
            <VideoPlayer url={videoUrl} />
          </div>
          <div className="p-4 dark:bg-netflix-black">
            <h1 className="text-xl font-bold dark:text-white">{'Room'}</h1>
            <p className="text-muted-foreground">Room Key: {roomKey || 'Loading...'}</p>
          </div>
        </div>

        {/* Chat Panel Section */}
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