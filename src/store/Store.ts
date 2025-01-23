import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import roomReducer from '@/slices/roomSlice';
import authReducer from '@/contexts/AuthContext';

export const store = configureStore({
  reducer: {
    room: roomReducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these field paths in all actions
        ignoredActionPaths: [
          'payload.createdAt', 
          'payload.user.createdAt', 
          'payload.userProfile.createdAt'
        ],
        ignoredPaths: [
          'room.rooms.createdAt', 
          'auth.userProfile.createdAt'
        ],
      },
    }),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Custom hooks for typed dispatch and selector
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;