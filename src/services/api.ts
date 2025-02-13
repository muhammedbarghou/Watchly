import axios, { AxiosInstance, AxiosError } from 'axios';

// Types
interface Participant {
  userId: string;
  role: 'admin' | 'moderator' | 'viewer';
  joinedAt: Date;
  lastActive: Date;
}

interface VideoState {
  currentTime: number;
  isPlaying: boolean;
  lastUpdate: Date;
  version: number;
}

interface RoomSettings {
  maxParticipants: number;
  allowChat: boolean;
  allowVolumeControl: boolean;
  allowSeek: boolean;
  allowRolePromotion: boolean;
}

interface Room {
  name: string;
  createdBy: string;
  key: string;
  videoUrl: string;
  password?: string;
  participants: Participant[];
  status: 'active' | 'inactive' | 'closed';
  videoState: VideoState;
  settings: RoomSettings;
  createdAt: Date;
  updatedAt: Date;
}

interface CreateRoomPayload {
  name: string;
  createdBy: string;
  videoUrl: string;
  key?: string;
  password?: string;
  settings?: Partial<RoomSettings>;
}

interface JoinRoomPayload {
  userId: string;
  password?: string;
}

interface UpdateRoomPayload {
  userId: string;
  updates: Partial<{
    name: string;
    videoUrl: string;
    password: string;
    settings: Partial<RoomSettings>;
  }>;
}

interface UpdateRolePayload {
  adminId: string;
  targetUserId: string;
  newRole: 'admin' | 'moderator' | 'viewer';
}

interface VideoStateUpdatePayload {
  userId: string;
  currentTime: number;
  isPlaying: boolean;
  version: number;
}

interface ApiErrorResponse {
  success: false;
  message: string;
  requestId: string;
  timestamp: string;
  errors?: string[];
  field?: string;
}

interface ApiSuccessResponse<T = any> {
  success: true;
  requestId: string;
  timestamp: string;
  room?: Room;
  message?: string;
  videoState?: VideoState;
  data?: T;
}

type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;

class ApiError extends Error {
  constructor(
    public message: string,
    public status: number,
    public requestId?: string,
    public errors?: string[],
    public field?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

class RoomAPI {
  private api: AxiosInstance;
  private lastRequestId?: string;

  constructor(baseURL: string = 'http://localhost:3000/api') {
    this.api = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true, // Enable credentials for CORS
      timeout: 10000, // 10 second timeout
    });

    // Request interceptor
    this.api.interceptors.request.use((config) => {
      // Track request ID if provided
      const requestId = crypto.randomUUID();
      config.headers['X-Request-ID'] = requestId;
      return config;
    });

    // Response interceptor
    this.api.interceptors.response.use(
      (response) => {
        // Store request ID from response headers
        this.lastRequestId = response.headers['x-request-id'];
        return response;
      },
      (error: AxiosError<ApiErrorResponse>) => {
        if (error.response) {
          const { data, status } = error.response;
          throw new ApiError(
            data.message,
            status,
            data.requestId,
            data.errors,
            data.field
          );
        } else if (error.request) {
          throw new ApiError(
            'Network error - no response received',
            0
          );
        } else {
          throw new ApiError(
            'Request configuration error',
            0
          );
        }
      }
    );
  }

  /**
   * Get the request ID from the last API call
   */
  getLastRequestId(): string | undefined {
    return this.lastRequestId;
  }

  /**
   * Create a new room
   */
  async createRoom(payload: CreateRoomPayload): Promise<ApiResponse<Room>> {
    const response = await this.api.post('/rooms', payload);
    return response.data;
  }

  /**
   * Join an existing room
   */
  async joinRoom(roomKey: string, payload: JoinRoomPayload): Promise<ApiResponse<Room>> {
    const response = await this.api.post(`/rooms/${roomKey}/join`, payload);
    return response.data;
  }

  /**
   * Update room details
   */
  async updateRoom(roomKey: string, payload: UpdateRoomPayload): Promise<ApiResponse<Room>> {
    const response = await this.api.put(`/rooms/${roomKey}`, payload);
    return response.data;
  }

  /**
   * Update participant role
   */
  async updateParticipantRole(roomKey: string, payload: UpdateRolePayload): Promise<ApiResponse> {
    const response = await this.api.patch(`/rooms/${roomKey}/roles`, payload);
    return response.data;
  }

  /**
   * Update video state
   */
  async updateVideoState(roomKey: string, payload: VideoStateUpdatePayload): Promise<ApiResponse> {
    const response = await this.api.put(`/rooms/${roomKey}/video-state`, payload);
    return response.data;
  }

  /**
   * Leave room
   */
  async leaveRoom(roomKey: string, userId: string): Promise<ApiResponse> {
    const response = await this.api.post(`/rooms/${roomKey}/leave`, { userId });
    return response.data;
  }

  /**
   * Delete room
   */
  async deleteRoom(roomKey: string, userId: string): Promise<ApiResponse> {
    const response = await this.api.delete(`/rooms/${roomKey}`, {
      data: { userId }
    });
    return response.data;
  }
}

export default RoomAPI;
export type { 
  ApiError,
  ApiResponse,
  Room,
  Participant,
  VideoState,
  RoomSettings,
  CreateRoomPayload,
  JoinRoomPayload,
  UpdateRoomPayload,
  UpdateRolePayload,
  VideoStateUpdatePayload
};