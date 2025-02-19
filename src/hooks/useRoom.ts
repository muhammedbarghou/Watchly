import { useState, useEffect } from 'react';
import { Room, CreateRoomDto} from '@/types/room';

export function useRoom(roomId?: string) {
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!roomId) return;

    const controller = new AbortController();
    const fetchRoom = async () => {
      try {
        const response = await fetch(`/api/rooms/${roomId}`, {
          signal: controller.signal
        });
        
        if (!response.ok) {
          throw new Error('Room not found');
        }
        
        const data = await response.json();
        setRoom(data);
        setError(null);
      } catch (err) {
        console.error('Room fetch error:', err);
        setError('Failed to load room');
      } finally {
        setLoading(false);
      }
    };

    fetchRoom();
    
    // Setup WebSocket connection for real-time updates
    const ws = new WebSocket(`ws://your-websocket-url/rooms/${roomId}`);
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setRoom(data);
    };

    return () => {
      controller.abort();
      ws.close();
    };
  }, [roomId]);

  const createRoom = async (data: CreateRoomDto) => {
    try {
      const response = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          createdAt: new Date(),
          participants: [],
          participantCount: 0,
          videoState: {
            currentTime: 0,
            isPlaying: false,
            playbackRate: 1,
            lastUpdatedBy: data.createdBy,
            lastUpdatedAt: new Date(),
          },
          settings: {
            chatEnabled: true,
            allowPlaybackControl: true,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create room');
      }

      return await response.json();
    } catch (err) {
      console.error('Create room error:', err);
      throw new Error('Failed to create room');
    }
  };

  const joinRoom = async ({ userId, name }: { userId: string; name: string }) => {
    if (!room) throw new Error('Room not found');
    if (!userId) throw new Error('User ID is required');

    try {
      const response = await fetch(`/api/rooms/${room.key}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, name }),
      });

      if (!response.ok) {
        throw new Error('Failed to join room');
      }

      const updatedRoom = await response.json();
      setRoom(updatedRoom);
    } catch (err) {
      console.error('Join room error:', err);
      throw new Error('Failed to join room');
    }
  };

  const updateVideoState = async ({ userId, currentTime, isPlaying }: {
    userId: string;
    currentTime: number;
    isPlaying: boolean;
  }) => {
    if (!room) return;

    try {
      await fetch(`/api/rooms/${room.key}/video-state`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, currentTime, isPlaying }),
      });
    } catch (err) {
      console.error('Update video state error:', err);
    }
  };

  const updateParticipantActivity = async (userId: string) => {
    if (!room) return;

    try {
      await fetch(`/api/rooms/${room.key}/participants/${userId}/activity`, {
        method: 'PUT'
      });
    } catch (err) {
      console.error('Update participant activity error:', err);
    }
  };

  const leaveRoom = async (userId: string) => {
    if (!room) return;

    try {
      await fetch(`/api/rooms/${room.key}/participants/${userId}`, {
        method: 'DELETE'
      });
    } catch (err) {
      console.error('Leave room error:', err);
    }
  };

  return {
    room,
    loading,
    error,
    createRoom,
    joinRoom,
    leaveRoom,
    updateVideoState,
    updateParticipantActivity,
  };
}