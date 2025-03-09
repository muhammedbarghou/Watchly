import { useAppDispatch, useAppSelector } from '@/store/Store';
import {
  signInWithEmailThunk,
  signUpThunk,
  signInWithGoogleThunk,
  signInWithFacebookThunk,
  logoutThunk,
  sendEmailVerificationThunk,
  verifyEmailThunk,
  clearAuthError,
} from '@/contexts/AuthContext';

export function useAuth() {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.auth.currentUser);
  const userProfile = useAppSelector((state) => state.auth.userProfile);
  const loading = useAppSelector((state) => state.auth.loading);
  const error = useAppSelector((state) => state.auth.error);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  const signInWithEmail = (email: string, password: string) =>
    dispatch(signInWithEmailThunk({ email, password }));

  const signUp = (email: string, password: string, fullName?: string) =>
    dispatch(signUpThunk({ email, password, fullName }));

  const signInWithGoogle = () => dispatch(signInWithGoogleThunk());
  const signInWithFacebook = () => dispatch(signInWithFacebookThunk());
  const logout = () => dispatch(logoutThunk());
  
  // Email verification functions
  const sendEmailVerification = () => dispatch(sendEmailVerificationThunk());
  const verifyEmail = (actionCode: string) => dispatch(verifyEmailThunk(actionCode));
  const clearError = () => dispatch(clearAuthError());

  return {
    currentUser,
    userProfile,
    loading,
    error,
    isAuthenticated,
    signInWithEmail,
    signUp,
    signInWithGoogle,
    signInWithFacebook,
    logout,
    sendEmailVerification,
    verifyEmail,
    clearError,
    isEmailVerified: currentUser?.emailVerified || false,
  };
}