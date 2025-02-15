import axios from 'axios';

const API_BASE_URL ='http://localhost:5000/api';

interface Room {
  id: string;
  key: string;
  name: string;
  createdBy: string;
  videoUrl: string;
  participants: Participant[];
  status: 'active' | 'paused' | 'closed' | 'archived';
  videoState: VideoState;
  settings: RoomSettings;
  metadata?: RoomMetadata;
}

interface Participant {
  userId: string;
  name: string;
  role: 'admin' | 'viewer' | 'moderator';
  joinedAt: Date;
  lastActive: Date;
}

interface VideoState {
  currentTime: number;
  isPlaying: boolean;
  playbackRate: number;
  lastUpdated: Date;
}

interface RoomSettings {
  isPrivate: boolean;
  allowSkip: boolean;
  allowPlaybackControl: boolean;
  maxParticipants: number;
  chatEnabled: boolean;
  autoCleanup: boolean;
}

interface RoomMetadata {
  description?: string;
  tags?: string[];
  category?: string;
  duration?: number;
}

interface CreateRoomData {
  name: string;
  videoUrl: string;
  createdBy: string;
  settings?: Partial<RoomSettings>;
  metadata?: Partial<RoomMetadata>;
}

interface JoinRoomData {
  roomKey: string;
  userId: string;
  name: string;
}

interface UpdateVideoState {
  currentTime: number;
  isPlaying: boolean;
  playbackRate?: number;
}

const roomService = {
  // Create a new room
  async createRoom(roomData: CreateRoomData): Promise<Room> {
    const response = await axios.post(`${API_BASE_URL}/rooms`, roomData);
    return response.data;
  },

  // Get room by key
  async getRoom(roomKey: string): Promise<Room> {
    const response = await axios.get(`${API_BASE_URL}/rooms/${roomKey}`);
    return response.data;
  },

  // Join an existing room
  async joinRoom(joinData: JoinRoomData): Promise<Room> {
    const response = await axios.post(`${API_BASE_URL}/rooms/${joinData.roomKey}/join`, {
      userId: joinData.userId,
      name: joinData.name
    });
    return response.data;
  },

  // Update video state (admin only)
  async updateVideoState(roomKey: string, userId: string, state: UpdateVideoState): Promise<Room> {
    const response = await axios.patch(`${API_BASE_URL}/rooms/${roomKey}/video-state`, {
      userId,
      state
    });
    return response.data;
  },

  // Leave a room
  async leaveRoom(roomKey: string, userId: string): Promise<void> {
    await axios.post(`${API_BASE_URL}/rooms/${roomKey}/leave`, { userId });
  },

  // Send chat message
  async sendMessage(roomKey: string, userId: string, message: string): Promise<void> {
    await axios.post(`${API_BASE_URL}/rooms/${roomKey}/chat`, {
      userId,
      message: message.slice(0, 200) // Limit message length
    });
  },

  // Get room participants
  async getParticipants(roomKey: string): Promise<Participant[]> {
    const response = await axios.get(`${API_BASE_URL}/rooms/${roomKey}/participants`);
    return response.data;
  },

  // Close a room (admin only)
  async closeRoom(roomKey: string, userId: string): Promise<Room> {
    const response = await axios.patch(`${API_BASE_URL}/rooms/${roomKey}/close`, { userId });
    return response.data;
  },

  // Update room settings (admin only)
  async updateRoomSettings(roomKey: string, userId: string, settings: Partial<RoomSettings>): Promise<Room> {
    const response = await axios.patch(`${API_BASE_URL}/rooms/${roomKey}/settings`, {
      userId,
      settings
    });
    return response.data;
  },

  // Get active rooms
  async getActiveRooms(): Promise<Room[]> {
    const response = await axios.get(`${API_BASE_URL}/rooms?status=active`);
    return response.data;
  }
};

export default roomService;