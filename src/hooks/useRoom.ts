import { useState, useEffect } from 'react';
import { Room, CreateRoomDto, JoinRoomDto, VideoStateUpdateDto } from '../types/room';
import { roomApi } from '../services/api';

export const useRoom = (roomKey?: string) => {
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRoom = async (key: string) => {
    try {
      setLoading(true);
      const data = await roomApi.getRoom(key);
      setRoom(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch room');
      setRoom(null);
    } finally {
      setLoading(false);
    }
  };

  const createRoom = async (data: CreateRoomDto) => {
    try {
      setLoading(true);
      const newRoom = await roomApi.createRoom(data);
      setRoom(newRoom);
      setError(null);
      return newRoom;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create room');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const joinRoom = async (key: string, data: JoinRoomDto) => {
    try {
      setLoading(true);
      const updatedRoom = await roomApi.joinRoom(key, data);
      setRoom(updatedRoom);
      setError(null);
      return updatedRoom;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join room');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const leaveRoom = async (key: string, userId: string) => {
    try {
      await roomApi.leaveRoom(key, userId);
      setRoom(null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to leave room');
      throw err;
    }
  };

  const updateVideoState = async (key: string, data: VideoStateUpdateDto) => {
    try {
      await roomApi.updateVideoState(key, data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update video state');
      throw err;
    }
  };

  useEffect(() => {
    if (roomKey) {
      fetchRoom(roomKey);
    }
  }, [roomKey]);

  return {
    room,
    loading,
    error,
    createRoom,
    joinRoom,
    leaveRoom,
    updateVideoState,
    refreshRoom: roomKey ? () => fetchRoom(roomKey) : undefined,
  };
};
