import { z } from 'zod';

// Participant types
export const ParticipantRole = z.enum(['admin', 'moderator', 'viewer']);
export type ParticipantRole = z.infer<typeof ParticipantRole>;

export const Participant = z.object({
  userId: z.string(),
  name: z.string(),
  role: ParticipantRole,
  joinedAt: z.date(),
  lastActive: z.date()
});
export type Participant = z.infer<typeof Participant>;

// Video state types
export const VideoState = z.object({
  currentTime: z.number(),
  isPlaying: z.boolean(),
  playbackRate: z.number(),
  lastUpdated: z.date()
});
export type VideoState = z.infer<typeof VideoState>;

// Room settings types
export const RoomSettings = z.object({
  isPrivate: z.boolean(),
  allowSkip: z.boolean(),
  allowPlaybackControl: z.boolean(),
  maxParticipants: z.number(),
  chatEnabled: z.boolean(),
  autoCleanup: z.boolean()
});
export type RoomSettings = z.infer<typeof RoomSettings>;

// Room status type
export const RoomStatus = z.enum(['active', 'paused', 'closed', 'archived']);
export type RoomStatus = z.infer<typeof RoomStatus>;

// Main Room type
export const Room = z.object({
  _id: z.string(),
  key: z.string(),
  name: z.string(),
  createdBy: z.string(),
  videoUrl: z.string().url(),
  participants: z.array(Participant),
  status: RoomStatus,
  videoState: VideoState,
  settings: RoomSettings,
  participantCount: z.number()
});
export type Room = z.infer<typeof Room>;

// DTO types
export const CreateRoomDto = z.object({
  name: z.string().min(3),
  createdBy: z.string(),
  videoUrl: z.string().url(),
  key: z.string(),
  isPublic: z.boolean(),
  password: z.string().min(4).optional(),
  maxParticipants: z.number().min(1),
  autoStart: z.boolean(),
  participants: z.array(Participant),
  videoState: VideoState,
  settings: RoomSettings
});
export type CreateRoomDto = z.infer<typeof CreateRoomDto>;

export const JoinRoomDto = z.object({
  userId: z.string(),
  name: z.string(),
  password: z.string().optional()
});
export type JoinRoomDto = z.infer<typeof JoinRoomDto>;

export const VideoStateUpdateDto = z.object({
  userId: z.string(),
  currentTime: z.number(),
  isPlaying: z.boolean()
});
export type VideoStateUpdateDto = z.infer<typeof VideoStateUpdateDto>;