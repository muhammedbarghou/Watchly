import { configureStore } from '@reduxjs/toolkit';
import roomReducer from '@/slices/roomSlice';

export const store = configureStore({
  reducer: {
    room: roomReducer, // Add the room slice to the store
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these field paths in all actions
        ignoredActionPaths: ['payload.createdAt'], // Ignore Firestore Timestamp in actions
        ignoredPaths: ['room.rooms.createdAt'], // Ignore Firestore Timestamp in state
      },
    }),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;