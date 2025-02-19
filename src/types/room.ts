export interface Participant {
  userId: string;
  name: string;
  role: 'admin' | 'viewer' | 'moderator';
  joinedAt: Date;
  lastActive: Date;
}

export interface RoomParticipant {
  userId: string;
  name: string;
  joinedAt: Date;
  lastActive: Date;
}

export interface VideoState {
  currentTime: number;
  isPlaying: boolean;
  playbackRate: number;
  lastUpdatedBy: string;
  lastUpdatedAt: Date;
}

export interface RoomSettings {
  chatEnabled: boolean;
  allowPlaybackControl: boolean;
}

export interface Room {
  key: string;
  name: string;
  videoUrl: string;
  password?: string;
  createdBy: string;
  createdAt: Date;
  participants: RoomParticipant[];
  videoState: VideoState;
  settings: RoomSettings;
  participantCount: number;
}

export interface CreateRoomDto {
  key: string;
  name: string;
  videoUrl: string;
  password?: string;
  createdBy: string;
}

export interface JoinRoomDto {
  userId: string;
  name: string;
  password?: string;
}

export interface VideoStateUpdateDto {
  userId: string;
  currentTime: number;
  isPlaying: boolean;
}
