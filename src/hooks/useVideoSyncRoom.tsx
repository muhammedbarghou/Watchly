import { useState, useEffect } from 'react';
import { ref, onValue, update, DataSnapshot, off } from 'firebase/database';
import { FirebaseError } from 'firebase/app';
import { rtdb } from '@/lib/firebase';

interface RoomData {
  key: string;
  name: string;
  videoUrl: string;
  participants: string[];
  createdBy: string;
  createdAt: number;
  playbackState: {
    currentTime: number;
    isPlaying: boolean;
    lastUpdated: number;
  };
}

const defaultRoomData: RoomData = {
  key: '',
  name: 'Unnamed Room',
  videoUrl: '',
  participants: [],
  createdBy: '',
  createdAt: Date.now(),
  playbackState: {
    currentTime: 0,
    isPlaying: false,
    lastUpdated: 0
  }
};

export const useVideoSyncRoom = (
  roomId: string | null, 
  userId: string
) => {
  const [roomData, setRoomData] = useState<RoomData>(defaultRoomData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Update room's video sync state
  const updateVideoSync = (updates: Partial<RoomData['playbackState']>) => {
    if (!roomId) return;

    const roomRef = ref(rtdb, `rooms/${roomId}/playbackState`);
    update(roomRef, {
      ...updates,
      lastUpdated: Date.now()
    });
  };

  // Update room details
  const updateRoomDetails = (updates: Partial<Omit<RoomData, 'playbackState' | 'key'>>) => {
    if (!roomId) return;

    const roomRef = ref(rtdb, `rooms/${roomId}`);
    update(roomRef, updates);
  };

  // Join or leave room
  const manageRoomParticipation = (action: 'join' | 'leave') => {
    if (!roomId) return;

    const roomRef = ref(rtdb, `rooms/${roomId}`);
    if (action === 'join') {
      update(roomRef, {
        participants: [...(roomData.participants || []), userId]
      });
    } else {
      update(roomRef, {
        participants: (roomData.participants || []).filter(id => id !== userId)
      });
    }
  };

  useEffect(() => {
    // Reset state
    setRoomData(defaultRoomData);
    setLoading(true);
    setError(null);

    if (!roomId) {
      setLoading(false);
      return;
    }

    const roomRef = ref(rtdb, `rooms/${roomId}`);

    const unsubscribe = onValue(
      roomRef,
      (snapshot: DataSnapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val() as RoomData;
          setRoomData({
            ...data,
            key: roomId,
            participants: data.participants || [],
            playbackState: data.playbackState || defaultRoomData.playbackState
          });
          setLoading(false);
        } else {
          setError('Room not found');
          setLoading(false);
        }
      },
      (err: Error) => {
        console.error('Room data error:', err);
        const firebaseError = err as FirebaseError;
        setError(firebaseError.code || 'Unknown error');
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
      off(roomRef);
    };
  }, [roomId]);

  return { 
    roomData, 
    loading, 
    error,
    updateVideoSync,
    updateRoomDetails,
    joinRoom: () => manageRoomParticipation('join'),
    leaveRoom: () => manageRoomParticipation('leave')
  };
};