
export interface RoomData {
  name: string;
  videoUrl: string;
  password?: string;
  createdBy: string;
}

export interface Room extends RoomData {
  key: ReactNode;
  id: string;
  participants: string[];
  createdAt: Date;
}

export interface CreateRoomInput {
  name: string;
  videoUrl: string;
  password?: string;
}

export interface JoinRoomInput {
  roomId: string;
  password?: string;
}

export interface RoomState {
  rooms: Room[];
  loading: boolean;
  error: string | null;
}

export interface RoomParticipant {
  userId: string;
  joinedAt: Date;
}

export interface RoomResponse {
  id: string;
  name: string;
  videoUrl: string;
  createdBy: string;
  participants: string[];
  createdAt: string; 
}