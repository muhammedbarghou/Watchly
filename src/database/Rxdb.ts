import { Room } from '@/types/room';
import Dexie, { type Table } from 'dexie';
import { User } from 'firebase/auth';

export interface DBRoom extends Omit<Room, 'id'> {
  id: string;
}

export interface DBUser extends User {
  id: string;
}

export class VideoSyncDB extends Dexie {
  rooms!: Table<DBRoom>;
  users!: Table<DBUser>;

  constructor() {
    super('VideoSyncDB');
    this.version(1).stores({
      rooms: 'id, lastUpdated',
      users: 'id, roomId, lastActive'
    });
  }
}

export const db = new VideoSyncDB();