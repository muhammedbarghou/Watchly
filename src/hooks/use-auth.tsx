import { useAppDispatch, useAppSelector } from '@/store/Store';
import {
  signInWithEmailThunk,
  signUpThunk,
  signInWithGoogleThunk,
  signInWithFacebookThunk,
  logoutThunk,
} from '@/contexts/AuthContext';

export function useAuth() {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.auth.currentUser);
  const userProfile = useAppSelector((state) => state.auth.userProfile);
  const loading = useAppSelector((state) => state.auth.loading);
  const error = useAppSelector((state) => state.auth.error);

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
    logout,
  };
}