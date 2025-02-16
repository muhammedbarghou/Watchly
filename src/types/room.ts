export interface Room {
  id: string;
  name: string;
  password: string;
  videoUrl: string;
  currentTime: number;
  isPlaying: boolean;
  lastUpdated: number;
  playbackRate: number;
}

export interface User {
  id: string;
  roomId: string;
  name: string;
  lastActive: number;
}

export type WSMessage = 
  | { type: 'JOIN'; roomId: string; userId: string }
  | { type: 'STATE'; roomId: string; state: Partial<Room> }
  | { type: 'USER_JOINED'; user: User }
  | { type: 'USER_LEFT'; userId: string };