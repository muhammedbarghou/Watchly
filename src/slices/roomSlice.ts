import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { collection, doc, addDoc, getDoc, getDocs, updateDoc, query, where, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Room, RoomData } from '@/types/room';

const roomsCollection = collection(db, 'rooms');

const roomService = {
  async createRoom(roomData: RoomData): Promise<string> {
    const docRef = await addDoc(roomsCollection, {
      ...roomData,
      createdAt: Timestamp.now(),
      participants: [roomData.createdBy],
    });
    return docRef.id;
  },

  async getRoom(roomId: string): Promise<Room | null> {
    const docRef = doc(roomsCollection, roomId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        name: data.name,
        videoUrl: data.videoUrl,
        password: data.password,
        createdBy: data.createdBy,
        participants: data.participants,
        createdAt: data.createdAt.toDate(),
      } as Room;
    }
    return null;
  },

  async getRooms(): Promise<Room[]> {
    const querySnapshot = await getDocs(roomsCollection);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        videoUrl: data.videoUrl,
        password: data.password,
        createdBy: data.createdBy,
        participants: data.participants,
        createdAt: data.createdAt.toDate(), // Convert Firestore Timestamp to JavaScript Date
      } as Room;
    });
  },

  async getUserRooms(userId: string): Promise<Room[]> {
    const q = query(roomsCollection, where('participants', 'array-contains', userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        videoUrl: data.videoUrl,
        password: data.password,
        createdBy: data.createdBy,
        participants: data.participants,
        createdAt: data.createdAt.toDate(), // Convert Firestore Timestamp to JavaScript Date
      } as Room;
    });
  },

  async joinRoom(roomId: string, userId: string): Promise<void> {
    const room = await this.getRoom(roomId);
    if (!room) throw new Error('Room not found');
    
    if (!room.participants.includes(userId)) {
      const roomRef = doc(roomsCollection, roomId);
      await updateDoc(roomRef, {
        participants: [...room.participants, userId]
      });
    }
  },

  async leaveRoom(roomId: string, userId: string): Promise<void> {
    const room = await this.getRoom(roomId);
    if (!room) throw new Error('Room not found');
    
    const roomRef = doc(roomsCollection, roomId);
    await updateDoc(roomRef, {
      participants: room.participants.filter(id => id !== userId)
    });
  }
};

const createRoomAsync = createAsyncThunk('room/createRoom', async (roomData: RoomData, { rejectWithValue }) => {
  try {
    const roomId = await roomService.createRoom(roomData);
    const room = await roomService.getRoom(roomId);
    if (!room) {
      throw new Error('Failed to fetch room after creation');
    }
    return room;
  } catch (error) {
    return rejectWithValue((error as Error).message);
  }
});

const joinRoomAsync = createAsyncThunk(
  'room/joinRoom',
  async ({ roomId, userId }: { roomId: string, userId: string }, { rejectWithValue }) => {
    try {
      await roomService.joinRoom(roomId, userId);
      const room = await roomService.getRoom(roomId);
      if (!room) {
        throw new Error('Failed to fetch room after joining');
      }
      return room; // Ensure the returned value is not null
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

const leaveRoomAsync = createAsyncThunk(
  'room/leaveRoom',
  async ({ roomId, userId }: { roomId: string, userId: string }, { rejectWithValue }) => {
    try {
      await roomService.leaveRoom(roomId, userId);
      const room = await roomService.getRoom(roomId);
      if (!room) {
        throw new Error('Failed to fetch room after leaving');
      }
      return room; // Ensure the returned value is not null
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

const roomSlice = createSlice({
  name: 'room',
  initialState: {
    rooms: [] as Room[],
    loading: false,
    error: null as string | null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearRooms: (state) => {
      state.rooms = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createRoomAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(createRoomAsync.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.rooms.push(action.payload);
        }
      })
      .addCase(createRoomAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to create room';
      })
      .addCase(joinRoomAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(joinRoomAsync.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.rooms = state.rooms.map(room =>
            room.id === action.payload.id ? action.payload : room
          );
        }
      })
      .addCase(joinRoomAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to join room';
      })
      .addCase(leaveRoomAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(leaveRoomAsync.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.rooms = state.rooms.map(room =>
            room.id === action.payload.id ? action.payload : room
          );
        }
      })
      .addCase(leaveRoomAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to leave room';
      });
  },
});

export const { clearError, clearRooms } = roomSlice.actions;
export default roomSlice.reducer;
export { createRoomAsync, joinRoomAsync, leaveRoomAsync, roomService };