import { collection, doc, addDoc, getDoc, getDocs, updateDoc, query, where, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface RoomData {
  name: string;
  videoUrl: string;
  password?: string;
  createdBy: string;
}

interface Room extends RoomData {
  id: string;
  participants: string[];
  createdAt: Timestamp;
}

const roomsCollection = collection(db, 'rooms');

export const roomService = {
  async createRoom(roomData: RoomData): Promise<string> {
    try {
      const docRef = await addDoc(roomsCollection, {
        ...roomData,
        createdAt: Timestamp.now(),
        participants: [roomData.createdBy],
      });
      
      return docRef.id;
    } catch (error) {
      console.error('Error creating room:', error);
      throw error;
    }
  },

  async getRoom(roomId: string): Promise<Room | null> {
    try {
      const docRef = doc(roomsCollection, roomId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        } as Room;
      }
      return null;
    } catch (error) {
      console.error('Error getting room:', error);
      throw error;
    }
  },

  async getRooms(): Promise<Room[]> {
    try {
      const querySnapshot = await getDocs(roomsCollection);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Room[];
    } catch (error) {
      console.error('Error getting rooms:', error);
      throw error;
    }
  },

  async getUserRooms(userId: string): Promise<Room[]> {
    try {
      const q = query(roomsCollection, where('participants', 'array-contains', userId));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Room[];
    } catch (error) {
      console.error('Error getting user rooms:', error);
      throw error;
    }
  },

  async joinRoom(roomId: string, userId: string): Promise<void> {
    try {
      const room = await this.getRoom(roomId);
      if (!room) throw new Error('Room not found');
      
      if (!room.participants.includes(userId)) {
        const roomRef = doc(roomsCollection, roomId);
        await updateDoc(roomRef, {
          participants: [...room.participants, userId]
        });
      }
    } catch (error) {
      console.error('Error joining room:', error);
      throw error;
    }
  },

  async leaveRoom(roomId: string, userId: string): Promise<void> {
    try {
      const room = await this.getRoom(roomId);
      if (!room) throw new Error('Room not found');
      
      const roomRef = doc(roomsCollection, roomId);
      await updateDoc(roomRef, {
        participants: room.participants.filter(id => id !== userId)
      });
    } catch (error) {
      console.error('Error leaving room:', error);
      throw error;
    }
  }
};