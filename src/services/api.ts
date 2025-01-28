// Types for room management
interface RoomSettings {
  maxParticipants?: number;
}

interface RoomUpdates {
  name?: string;
  videoUrl?: string;
  password?: string;
  settings?: RoomSettings;
}

interface CreateRoomData {
  name: string;
  createdBy: string;
  videoUrl: string;
  key: string;
  password?: string;
  settings?: RoomSettings;
}

interface JoinRoomData {
  key: string;
  userId: string;
  password?: string;
}

interface UpdateRoleData {
  key: string;
  adminId: string;
  targetUserId: string;
  newRole: 'admin' | 'moderator' | 'viewer';
}

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  errors?: Array<{ msg: string }>;
}

// API client class
class RoomAPI {
  private baseUrl: string;

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl;
  }

  private async fetchWithError<T>(
    endpoint: string,
    options: RequestInit
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.errors?.[0]?.msg || 'An error occurred');
      }

      return data;
    } catch (error) {
      return {
        success: false,
        errors: [{ msg: error instanceof Error ? error.message : 'An error occurred' }],
      };
    }
  }

  async createRoom(roomData: CreateRoomData): Promise<ApiResponse> {
    return this.fetchWithError('/rooms/create', {
      method: 'POST',
      body: JSON.stringify(roomData),
    });
  }

  async joinRoom(joinData: JoinRoomData): Promise<ApiResponse> {
    return this.fetchWithError('/rooms/join', {
      method: 'POST',
      body: JSON.stringify(joinData),
    });
  }

  async updateRoom(
    key: string,
    userId: string,
    updates: RoomUpdates
  ): Promise<ApiResponse> {
    return this.fetchWithError('/rooms/update', {
      method: 'PUT',
      body: JSON.stringify({ key, userId, updates }),
    });
  }

  async updateParticipantRole(roleData: UpdateRoleData): Promise<ApiResponse> {
    return this.fetchWithError('/rooms/role', {
      method: 'PUT',
      body: JSON.stringify(roleData),
    });
  }

  async deleteRoom(key: string, userId: string): Promise<ApiResponse> {
    return this.fetchWithError('/rooms/delete', {
      method: 'DELETE',
      body: JSON.stringify({ key, userId }),
    });
  }
}

const roomApi = new RoomAPI();
export default roomApi;

export {
  RoomAPI,
  type CreateRoomData,
  type JoinRoomData,
  type UpdateRoleData,
  type RoomSettings,
  type RoomUpdates,
  type ApiResponse,
};