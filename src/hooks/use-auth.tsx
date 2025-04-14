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
import { useEffect, useState, useCallback } from 'react';
import { getAuth } from 'firebase/auth';

export function useAuth() {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.auth.currentUser);
  const userProfile = useAppSelector((state) => state.auth.userProfile);
  const loading = useAppSelector((state) => state.auth.loading);
  const error = useAppSelector((state) => state.auth.error);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const [isThirdPartyAuth, setIsThirdPartyAuth] = useState(false);

  // More reliable check for third-party authentication
  const checkThirdPartyAuth = useCallback(() => {
    try {
      const auth = getAuth();
      const firebaseUser = auth.currentUser;
      
      if (!firebaseUser) {
        console.log('No Firebase user found in checkThirdPartyAuth');
        setIsThirdPartyAuth(false);
        return false;
      }
      
      // Safely check provider data
      const providerData = firebaseUser.providerData || [];
      console.log('Provider data:', JSON.stringify(providerData.map(p => p.providerId)));
      
      // Check if any provider is Google or Facebook
      const isOAuthProvider = providerData.some(
        provider => 
          provider.providerId === 'google.com' || 
          provider.providerId === 'facebook.com'
      );
      
      console.log('Is OAuth provider:', isOAuthProvider);
      setIsThirdPartyAuth(isOAuthProvider);
      return isOAuthProvider;
    } catch (error) {
      console.error('Error in checkThirdPartyAuth:', error);
      setIsThirdPartyAuth(false);
      return false;
    }
  }, []);

  // Check for third-party auth providers on mount and when currentUser changes
  useEffect(() => {
    // Check on component mount
    const initialCheck = setTimeout(() => {
      checkThirdPartyAuth();
    }, 1000); // Delay the initial check slightly to ensure Firebase is ready

    return () => clearTimeout(initialCheck);
  }, []); // Empty dependency array for mount only
  
  // Check when currentUser changes
  useEffect(() => {
    if (currentUser) {
      checkThirdPartyAuth();
    } else {
      setIsThirdPartyAuth(false);
    }
  }, [currentUser, checkThirdPartyAuth]);

  // Add an effect to periodically check the auth state when authenticated
  // This helps in case the provider information is loaded asynchronously
  useEffect(() => {
    if (!currentUser) return;
    
    const interval = setInterval(() => {
      const newValue = checkThirdPartyAuth();
      console.log('Periodic third-party auth check:', newValue);
    }, 3000); // Check every 3 seconds while user is logged in
    
    return () => clearInterval(interval);
  }, [currentUser, checkThirdPartyAuth]);

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
  
  // Calculate isEmailVerified based on both direct verification and third-party auth
  const isEmailVerified = currentUser?.emailVerified || isThirdPartyAuth || false;
  
  // Add debug info when auth changes
  useEffect(() => {
    console.log('Auth state update:', {
      hasUser: !!currentUser, 
      emailVerified: currentUser?.emailVerified,
      isThirdPartyAuth,
      isEmailVerified,
      loading
    });
  }, [currentUser, isThirdPartyAuth, isEmailVerified, loading]);

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
    isEmailVerified,
    isThirdPartyAuth,
  };
}