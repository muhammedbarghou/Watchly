import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { VideoPlayer } from '../components/room/VideoPlayer';
import { useWebSocket } from '@/hooks/useWebSocket';
import { WSMessage } from '@/types/room';
import { db } from '@/database/Rxdb';
import { Loader } from '@/components/ui/loader';

interface RoomDetails {
  name: string;
  videoUrl: string;
  password: string;
  id: string;
}

export function RoomPage() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [roomDetails, setRoomDetails] = useState<RoomDetails | null>(null);
  const [loading, setLoading] = useState(true);

  // WebSocket setup
  const handleMessage = useCallback((msg: WSMessage) => {
    if (msg.type === 'STATE') {
      db.rooms.update(msg.roomId, msg.state);
    }
  }, []);

  const { sendMessage } = useWebSocket('ws://localhost:8080', handleMessage);

  // Load room details
  useEffect(() => {
    const loadRoom = async () => {
      try {
        const storedRoomDetails = localStorage.getItem('roomDetails');
        if (!storedRoomDetails) {
          navigate('/error');
          return;
        }

        const parsedDetails = JSON.parse(storedRoomDetails) as RoomDetails;
        if (parsedDetails.id !== roomId) {
          navigate('/error');
          return;
        }

        // Initialize room in IndexedDB
        await db.rooms.put({
          id: parsedDetails.id,
          videoUrl: parsedDetails.videoUrl,
          currentTime: 0,
          isPlaying: true,
          playbackRate: 1,
          lastUpdated: Date.now(),
          name: '',
          password: ''
        });

        setRoomDetails(parsedDetails);
        setLoading(false);

        // Join room via WebSocket
        sendMessage({
          type: 'JOIN',
          roomId: parsedDetails.id,
          userId: 'current-user-id' // Replace with actual user ID
        });
      } catch (error) {
        console.error('Error loading room:', error);
        navigate('/error');
      }
    };

    loadRoom();
  }, [roomId, navigate, sendMessage]);

  if (loading || !roomDetails) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <Loader className="w-12 h-12 text-netflix-red" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="h-[calc(100vh-64px)]">
        <div className="flex-1 flex flex-col h-full">
          <div className="flex-1 bg-black">
            <VideoPlayer 
              url={roomDetails.videoUrl} 
              roomId={roomDetails.id}
              sendMessage={sendMessage}
            />
          </div>
          <div className="p-4 dark:bg-netflix-black">
            <h1 className="text-xl font-bold dark:text-white">
              Room: {roomDetails.name}
            </h1>
            <p className="text-muted-foreground">
              Room Key: {roomDetails.password}
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}