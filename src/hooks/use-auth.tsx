import React, { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, getFirestore } from 'firebase/firestore';
import { auth } from '../lib/firebase';
import { useAppDispatch, useAppSelector } from '@/store/Store';
import {
  signInWithEmailThunk,
  signUpThunk,
  signInWithGoogleThunk,
  signInWithFacebookThunk,
  logoutThunk
} from '@/contexts/AuthContext';

const db = getFirestore();

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      }
    });

    return unsubscribe;
  }, [dispatch]);

  return <>{children}</>;
}

export function useAuth() {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(state => state.auth.currentUser);
  const userProfile = useAppSelector(state => state.auth.userProfile);
  const loading = useAppSelector(state => state.auth.loading);
  const error = useAppSelector(state => state.auth.error);

  const signInWithEmail = (email: string, password: string) =>
    dispatch(signInWithEmailThunk({ email, password }));

  const signUp = (email: string, password: string, fullName?: string) =>
    dispatch(signUpThunk({ email, password, fullName }));

  const signInWithGoogle = () => dispatch(signInWithGoogleThunk());
  const signInWithFacebook = () => dispatch(signInWithFacebookThunk());
  const logout = () => dispatch(logoutThunk());

  return {
    currentUser,
    userProfile,
    loading,
    error,
    signInWithEmail,
    signUp,
    signInWithGoogle,
    signInWithFacebook,
    logout
  };
}