import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, addDoc } from 'firebase/firestore';
import { Chat, Message } from '@/types/chat';

interface ChatState {
  chats: Chat[];
  selectedChatId: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: ChatState = {
  chats: [],
  selectedChatId: null,
  loading: false,
  error: null,
};

export const fetchChats = createAsyncThunk(
  'chat/fetchChats',
  async (userId: string) => {
    const chatsRef = collection(db, 'chats');
    const q = query(
      chatsRef,
      // Add your Firebase queries here (e.g., where('members', 'array-contains', userId))
      orderBy('timestamp', 'desc')
    );
    
    return new Promise<Chat[]>((resolve) => {
      onSnapshot(q, (snapshot) => {
        const chats = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Chat[];
        resolve(chats);
      });
    });
  }
);

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async ({ chatId, message }: { chatId: string; message: Partial<Message> }) => {
    const messagesRef = collection(db, `chats/${chatId}/messages`);
    await addDoc(messagesRef, {
      ...message,
      timestamp: Date.now()
    });
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setSelectedChat: (state, action) => {
      state.selectedChatId = action.payload;
    },
    updateChatMessages: (state, action) => {
      const { chatId, messages } = action.payload;
      const chat = state.chats.find(c => c.id === chatId);
      if (chat) {
        chat.messages = messages;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchChats.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchChats.fulfilled, (state, action) => {
        state.chats = action.payload as Chat[];
        state.loading = false;
      })
      .addCase(fetchChats.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to fetch chats';
        state.loading = false;
      });
  },
});

export const { setSelectedChat, updateChatMessages } = chatSlice.actions;
export default chatSlice.reducer;
