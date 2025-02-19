import axios from 'axios';
import { 
  Room, 
  CreateRoomDto, 
  JoinRoomDto, 
  VideoStateUpdateDto 
} from '../types/room';

const API_BASE_URL ='http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

export const roomApi = {
  // Create a new room
  createRoom: async (data: CreateRoomDto): Promise<Room> => {
    const response = await api.post<Room>('/rooms', data);
    return response.data;
  },

  // Get room details
  getRoom: async (key: string): Promise<Room> => {
    const response = await api.get<Room>(`/rooms/${key}`);
    return response.data;
  },

  // Join a room
  joinRoom: async (key: string, data: JoinRoomDto): Promise<Room> => {
    const response = await api.post<Room>(`/rooms/${key}/join`, data);
    return response.data;
  },

  // Leave a room
  leaveRoom: async (key: string, userId: string): Promise<void> => {
    await api.post(`/rooms/${key}/leave`, { userId });
  },

  // Update video state
  updateVideoState: async (key: string, data: VideoStateUpdateDto): Promise<void> => {
    await api.patch(`/rooms/${key}/video-state`, data);
  },

  // Delete a room
  deleteRoom: async (key: string, userId: string): Promise<void> => {
    await api.delete(`/rooms/${key}`, { data: { userId } });
  }
};
