import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { rtdb } from '@/lib/firebase';
import { ref, onValue, set, off, get } from 'firebase/database';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';

interface RoomData {
  id: string;
  name: string;
  videoUrl: string;
  createdBy: string;
  isPublic: boolean;
  password: string | null;
  createdAt: string;
  participants: Participant[];
  videoState: VideoState;
}

interface Participant {
  userId: string;
  name: string;
  role: string;
  joinedAt: string;
}

interface VideoState {
  currentTime: number;
  isPlaying: boolean;
  playbackRate: number;
  lastUpdated: string;
}

interface CreateRoomParams {
  name: string;
  videoUrl: string;
  isPublic: boolean;
  password?: string;
}

interface UpdateVideoStateParams {
  currentTime?: number;
  isPlaying?: boolean;
  playbackRate?: number;
}

export function useRoom(roomId?: string) {
  const { currentUser } = useAuth();
  const [room, setRoom] = useState<RoomData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create a new room
  const createRoom = async ({ name, videoUrl, isPublic, password }: CreateRoomParams) => {
    if (!currentUser) {
      throw new Error('Must be logged in to create a room');
    }
    setLoading(true);

    try {
      const newRoomId = uuidv4();
      const roomData: RoomData = {
        id: newRoomId,
        name: name.trim(),
        videoUrl: videoUrl.trim(),
        createdBy: currentUser.uid,
        isPublic,
        password: isPublic ? null : password || null,
        createdAt: new Date().toISOString(),
        participants: [
          {
            userId: currentUser.uid,
            name: currentUser.displayName || 'Anonymous',
            role: 'admin',
            joinedAt: new Date().toISOString(),
          },
        ],
        videoState: {
          currentTime: 0,
          isPlaying: false,
          playbackRate: 1,
          lastUpdated: new Date().toISOString(),
        },
      };

      const roomRef = ref(rtdb, `rooms/${newRoomId}`);
      await set(roomRef, roomData);
      setRoom(roomData);
      toast.success('Room created successfully!');
      return newRoomId;
    } catch (err) {
      console.error('Error creating room:', err);
      toast.error('Failed to create room');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Join an existing room
  const joinRoom = async (password?: string) => {
    if (!currentUser || !roomId) return;
    setLoading(true);

    try {
      const roomRef = ref(rtdb, `rooms/${roomId}`);
      const snapshot = await get(roomRef);
      const roomData = snapshot.val();

      if (!snapshot.exists()) {
        throw new Error('Room not found');
      }

      if (!roomData.isPublic && roomData.password !== password) {
        throw new Error('Incorrect password');
      }

      const isParticipant = roomData.participants.some(
        (p: Participant) => p.userId === currentUser.uid
      );

      if (!isParticipant) {
        const newParticipant: Participant = {
          userId: currentUser.uid,
          name: currentUser.displayName || 'Anonymous',
          role: 'viewer',
          joinedAt: new Date().toISOString(),
        };

        const updatedParticipants = [...roomData.participants, newParticipant];
        await set(ref(rtdb, `rooms/${roomId}/participants`), updatedParticipants);
      }

      setRoom({ ...roomData, participants: [...roomData.participants] });
      toast.success('Joined room successfully!');
    } catch (err) {
      console.error('Error joining room:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to join room');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Leave a room
  const leaveRoom = async () => {
    if (!currentUser || !roomId || !room) return;

    try {
      const participantIndex = room.participants.findIndex(
        (p) => p.userId === currentUser.uid
      );

      if (participantIndex !== -1) {
        const updatedParticipants = room.participants.filter(
          (p) => p.userId !== currentUser.uid
        );
        await set(ref(rtdb, `rooms/${roomId}/participants`), updatedParticipants);
      }

      setRoom(null);
      toast.success('Left room successfully');
    } catch (err) {
      console.error('Error leaving room:', err);
      toast.error('Failed to leave room');
      throw err;
    }
  };

  // Update video state
  const updateVideoState = async (params: UpdateVideoStateParams) => {
    if (!currentUser || !roomId || !room) return;

    try {
      const newVideoState: VideoState = {
        ...room.videoState,
        ...params,
        lastUpdated: new Date().toISOString(),
      };

      await set(ref(rtdb, `rooms/${roomId}/videoState`), newVideoState);
    } catch (err) {
      console.error('Error updating video state:', err);
      toast.error('Failed to update video state');
    }
  };

  // Fetch room data with real-time updates
  useEffect(() => {
    if (!roomId) return;

    const roomRef = ref(rtdb, `rooms/${roomId}`);
    setLoading(true);

    const unsubscribe = onValue(roomRef, (snapshot) => {
      if (!snapshot.exists()) {
        setError('Room not found');
        setRoom(null);
        return;
      }

      const roomData = snapshot.val() as RoomData;
      setRoom(roomData);
      setError(null);
      setLoading(false);
    }, (err) => {
      console.error('Error listening to room:', err);
      setError('Failed to load room');
      setLoading(false);
    });

    return () => off(roomRef); // Cleanup listener
  }, [roomId]);

  return {
    room,
    loading,
    error,
    createRoom,
    joinRoom,
    leaveRoom,
    updateVideoState,
  };
}