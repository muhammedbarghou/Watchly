export interface Participant {
  userId: string;
  name: string;
  role: 'admin' | 'viewer' | 'moderator';
  joinedAt: Date;
  lastActive: Date;
}

export interface VideoState {
  currentTime: number;
  isPlaying: boolean;
  playbackRate: number;
  lastUpdated: Date;
}

export interface RoomSettings {
  isPrivate: boolean;
  allowSkip: boolean;
  allowPlaybackControl: boolean;
  maxParticipants: number;
  chatEnabled: boolean;
  autoCleanup: boolean;
}

export interface Room {
  _id: string;
  key: string;
  name: string;
  createdBy: string;
  videoUrl: string;
  participants: Participant[];
  status: 'active' | 'paused' | 'closed' | 'archived';
  videoState: VideoState;
  settings: RoomSettings;
  participantCount: number;
}

export interface CreateRoomDto {
  name: string;
  createdBy: string;
  videoUrl: string;
  key: string;
  password?: string;
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
