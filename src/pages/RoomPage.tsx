import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { MainLayout } from '../components/layout/MainLayout';
import { VideoPlayer } from '../components/room/VideoPlayer';
import { ChatPanel } from '../components/room/ChatPanel';
import { Skeleton } from '../components/ui/skeleton';
import roomService from '../api/roomService';
import { useAuth } from '@/hooks/use-auth';

interface Message {
  id: string;
  username: string;
  message: string;
  timestamp: Date;
}

export function RoomPage() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [room, setRoom] = useState<Room | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [videoState, setVideoState] = useState<VideoState | null>(null);

  const loadRoomData = useCallback(async () => {
    if (!roomId || !currentUser) {
      toast.error('Please login to join the room');
      navigate('/');
      return;
    }

    try {
      // Get room data using roomService
      const roomData = await roomService.getRoom(roomId);
      
      // Join the room
      await roomService.joinRoom({
        roomKey: roomId,
        userId: currentUser.customUID,
        name: currentUser.displayName
      });

      setRoom(roomData);

      // Get initial participants
      const participants = await roomService.getParticipants(roomId);
      
      // Update video state if you're not the first participant
      if (participants.length > 1) {
        const currentState = roomData.videoState;
        setVideoState(currentState);
      }

    } catch (error) {
      console.error('Failed to load room:', error);
      toast.error('Failed to load room data');
      navigate('/');
    } finally {
      setIsLoading(false);
    }
  }, [roomId, navigate, currentUser]);

  useEffect(() => {
    const abortController = new AbortController();
    loadRoomData();
    return () => {
      // Cleanup: Leave room when component unmounts
      if (roomId && currentUser) {
        roomService.leaveRoom(roomId, currentUser.id).catch(console.error);
      }
      abortController.abort();
    };
  }, [loadRoomData, roomId, currentUser]);

  const handleVideoStateChange = useCallback(async (state: UpdateVideoState) => {
    if (!roomId || !currentUser || !room) return;

    try {
      if (room.settings.allowPlaybackControl || room.createdBy === currentUser.id) {
        const updatedRoom = await roomService.updateVideoState(roomId, currentUser.id, state);
        setVideoState(updatedRoom.videoState);
      } else {
        toast.error('You do not have permission to control playback');
      }
    } catch (error) {
      console.error('Failed to update video state:', error);
      toast.error('Failed to sync video state');
    }
  }, [roomId, currentUser, room]);

  const handleSendMessage = useCallback(async (message: string) => {
    if (!roomId || !currentUser || !room?.settings.chatEnabled) return;

    try {
      await roomService.sendMessage(roomId, currentUser.id, message);
      
      const newMessage: Message = {
        id: Date.now().toString(),
        username: currentUser.displayName || 'Anonymous',
        message,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, newMessage]);
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
    }
  }, [roomId, currentUser, room]);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex h-[calc(100vh-64px)]">
          <Skeleton className="w-full h-full" />
        </div>
      </MainLayout>
    );
  }

  if (!room) {
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
                url={room.videoUrl}
                onStateChange={handleVideoStateChange}
                initialState={videoState}
                isController={room.createdBy === currentUser?.id}
                allowControl={room.settings.allowPlaybackControl}
              />
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              <h1 className="text-2xl font-bold text-white">
                {room.name}
              </h1>
              <p className="text-gray-300">
                Created by: {room.metadata?.createdByName || 'Unknown'}
              </p>
            </div>
          </div>
        </div>

        {/* Chat Section */}
        {room.settings.chatEnabled && (
          <div className="w-full lg:w-96 h-96 lg:h-full border-t lg:border-l lg:border-t-0 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
            <ChatPanel
              messages={messages}
              onSendMessage={handleSendMessage}
              currentUser={currentUser?.name || 'Anonymous'}
            />
          </div>
        )}
      </div>
    </MainLayout>
  );
}