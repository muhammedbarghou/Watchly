import axios, { AxiosError, AxiosResponse } from 'axios';
import { w3cwebsocket as WebSocket } from 'websocket';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Type definitions
interface Room {
  id: string;
  name: string;
  createdBy: string;
  participants: Participant[];
  videoUrl: string;
  settings: RoomSettings;
  createdAt?: Date;
}

interface Participant {
  userId: string;
  role: 'admin' | 'moderator' | 'viewer';
  joinedAt?: Date;
}

interface RoomSettings {
  maxParticipants: number;
  allowChat: boolean;
  allowVolumeControl: boolean;
  allowSeek: boolean;
  allowedHosts?: string[];
}

interface VideoState {
  currentTime: number;
  isPlaying: boolean;
  updatedAt?: Date;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export const roomApi = {
  createRoom: async (roomData: {
    name: string;
    createdBy: string;
    videoUrl: string;
    password?: string;
    settings?: Partial<RoomSettings>;
  }): Promise<Room | undefined> => {
    try {
      const response: AxiosResponse<ApiResponse<Room>> = await apiClient.post('/rooms', roomData);
      return handleResponse(response);
    } catch (error) {
      handleApiError(error as AxiosError<ApiResponse<any>>);
      return undefined;
    }
  },

  joinRoom: async (
    key: string,
    joinData: {
      userId: string;
      password?: string;
    }
  ): Promise<{ room: Room; participant: Participant } | undefined> => {
    try {
      const response: AxiosResponse<ApiResponse<{ room: Room; participant: Participant }>> = 
        await apiClient.post(`/rooms/${key}/join`, joinData);
      return handleResponse(response);
    } catch (error) {
      handleApiError(error as AxiosError<ApiResponse<any>>);
      return undefined;
    }
  },

  updateRoom: async (
    key: string,
    updateData: {
      userId: string;
      updates: Partial<{
        name: string;
        videoUrl: string;
        password?: string;
        settings?: Partial<RoomSettings>;
      }>;
    }
  ): Promise<Room | undefined> => {
    try {
      const response: AxiosResponse<ApiResponse<Room>> = 
        await apiClient.put(`/rooms/${key}`, updateData);
      return handleResponse(response);
    } catch (error) {
      handleApiError(error as AxiosError<ApiResponse<any>>);
      return undefined;
    }
  },

  updateParticipantRole: async (
    key: string,
    roleData: {
      adminId: string;
      targetUserId: string;
      newRole: 'admin' | 'moderator' | 'viewer';
    }
  ): Promise<Participant | undefined> => {
    try {
      const response: AxiosResponse<ApiResponse<Participant>> = 
        await apiClient.patch(`/rooms/${key}/roles`, roleData);
      return handleResponse(response);
    } catch (error) {
      handleApiError(error as AxiosError<ApiResponse<any>>);
    }
  },

  updateVideoState: async (
    key: string,
    videoState: {
      userId: string;
      currentTime: number;
      isPlaying: boolean;
    }
  ): Promise<VideoState | undefined> => {
    try {
      const response: AxiosResponse<ApiResponse<VideoState>> = 
        await apiClient.put(`/rooms/${key}/video-state`, videoState);
      return handleResponse(response);
    } catch (error) {
      handleApiError(error as AxiosError<ApiResponse<any>>);
    }
  },

  leaveRoom: async (key: string, userId: string): Promise<void> => {
    try {
      await apiClient.post(`/rooms/${key}/leave`, { userId });
    } catch (error) {
      handleApiError(error as AxiosError<ApiResponse<any>>);
    }
  },

  deleteRoom: async (key: string, userId: string): Promise<void> => {
    try {
      await apiClient.delete(`/rooms/${key}`, { data: { userId } });
    } catch (error) {
      handleApiError(error as AxiosError<ApiResponse<any>>);
    }
  },
};

// WebSocket Manager
export class RoomWebSocket {
  private ws: WebSocket | undefined;
  private reconnectInterval = 1000;
  private maxReconnectAttempts = 5;
  private reconnectAttempts = 0;

  constructor(
    private roomKey: string,
    private userId: string,
    private messageHandler: (data: any) => void,
    private onConnect?: () => void,
    private onDisconnect?: () => void,
  ) {
    this.connect();
  }

  private connect() {
    this.ws = new WebSocket(
      `${import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:3000'}/rooms/${this.roomKey}/ws?userId=${this.userId}`
    );

    this.ws.onopen = () => {
      this.reconnectAttempts = 0;
      this.onConnect?.();
    };

    this.ws.onmessage = (message) => {
      if (typeof message.data === 'string') {
        try {
          const data = JSON.parse(message.data);
          this.messageHandler(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    this.ws.onclose = (event) => {
      console.log(`WebSocket closed: ${event.reason}`);
      this.onDisconnect?.();
      if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
        setTimeout(() => this.connect(), this.reconnectInterval);
        this.reconnectAttempts++;
      }
    };
  }

  send(message: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
      return true;
    }
    return false;
  }

  close() {
    if (this.ws) {
      this.ws.close();
    }
  }
}

// Helper functions
function handleResponse<T>(response: AxiosResponse<ApiResponse<T>>): T {
  if (response.data.success && response.data.data) {
    return response.data.data;
  }
  throw new Error(response.data.error || 'Unknown API error');
}

function handleApiError(error: AxiosError<ApiResponse<any>>) {
  if (error.response) {
    const serverError = error.response.data?.error || error.message;
    throw new Error(serverError);
  } else if (error.request) {
    throw new Error('No response received from server');
  } else {
    throw new Error('Error setting up request: ' + error.message);
  }
}