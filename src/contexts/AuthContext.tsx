import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  getFirestore, 
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { auth } from '../lib/firebase';

interface UserProfile {
  uid: string;
  customUID: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  provider: string;
  isOnline: boolean;
  friends: string[];
  friendRequests: string[];
  blockedUsers: string[];
}

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName?: string) => Promise<void>;
  signInWithGoogle: () => Promise<{ customUID: string }>;
  signInWithFacebook: () => Promise<{ customUID: string }>;
  logout: () => Promise<void>;
  getUserCustomUID: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | null>(null);
const db = getFirestore();

const generateCustomUID = (): string => {
  const min = 100000;
  const max = 999999;
  return Math.floor(Math.random() * (max - min + 1) + min).toString();
};

const isUIDTaken = async (uid: string): Promise<boolean> => {
  try {
    const uidRef = doc(db, 'uids', uid);
    const uidDoc = await getDoc(uidRef);
    return uidDoc.exists();
  } catch (error) {
    console.error('Error checking UID:', error);
    throw new Error('Failed to check UID availability');
  }
};

const generateUniqueUID = async (): Promise<string> => {
  let attempts = 0;
  const maxAttempts = 10;
  
  while (attempts < maxAttempts) {
    const uid = generateCustomUID();
    const taken = await isUIDTaken(uid);
    
    if (!taken) {
      return uid;
    }
    attempts++;
  }
  
  throw new Error('Failed to generate unique UID after multiple attempts');
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setUserProfile(userDoc.data() as UserProfile);
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const createUserDocument = async (user: User, customUID: string, provider: string, fullName?: string) => {
    try {
      const userProfile: UserProfile = {
        uid: user.uid,
        customUID,
        email: user.email,
        displayName: fullName || user.displayName,
        photoURL: user.photoURL,
        createdAt: serverTimestamp() as Timestamp,
        updatedAt: serverTimestamp() as Timestamp,
        provider,
        isOnline: true,
        friends: [],
        friendRequests: [],
        blockedUsers: []
      };
      await setDoc(doc(db, 'users', user.uid), userProfile);
      return userProfile;
    } catch (error) {
      console.error('Error creating user document:', error);
      throw new Error('Failed to create user document');
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      if (userDoc.exists()) {
        await setDoc(doc(db, 'users', result.user.uid), {
          isOnline: true,
          lastSeen: serverTimestamp()
        }, { merge: true });
      }
    } catch (error) {
      console.error('Error signing in with email:', error);
      throw new Error('Failed to sign in with email');
    }
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      const customUID = await generateUniqueUID();
      
      if (fullName) {
        await updateProfile(user, { displayName: fullName });
      }
      
      const userProfile = await createUserDocument(user, customUID, 'email', fullName);
      setUserProfile(userProfile);
    } catch (error) {
      console.error('Error signing up:', error);
      throw new Error('Failed to sign up');
    }
  };

  const handleSocialSignIn = async (user: User, provider: string): Promise<string> => {
    try {
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        const customUID = await generateUniqueUID();
        const userProfile = await createUserDocument(user, customUID, provider);
        setUserProfile(userProfile);
        return customUID;
      } else {
        await setDoc(userRef, {
          isOnline: true,
          lastSeen: serverTimestamp()
        }, { merge: true });
        setUserProfile(userDoc.data() as UserProfile);
        return userDoc.data().customUID;
      }
    } catch (error) {
      console.error('Error handling social sign-in:', error);
      throw new Error('Failed to handle social sign-in');
    }
  };

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const { user } = await signInWithPopup(auth, provider);
      const customUID = await handleSocialSignIn(user, 'google');
      return { customUID };
    } catch (error) {
      console.error('Error during Google sign-in:', error);
      throw new Error('Failed to sign in with Google');
    }
  };

  const signInWithFacebook = async () => {
    try {
      const provider = new FacebookAuthProvider();
      const { user } = await signInWithPopup(auth, provider);
      const customUID = await handleSocialSignIn(user, 'facebook');
      return { customUID };
    } catch (error) {
      console.error('Error during Facebook sign-in:', error);
      throw new Error('Failed to sign in with Facebook');
    }
  };

  const logout = async () => {
    try {
      if (currentUser) {
        await setDoc(doc(db, 'users', currentUser.uid), {
          isOnline: false,
          lastSeen: serverTimestamp()
        }, { merge: true });
      }
      await signOut(auth);
    } catch (error) {
      console.error('Error logging out:', error);
      throw new Error('Failed to log out');
    }
  };

  const getUserCustomUID = async () => {
    if (!currentUser) return null;
    
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      const userDoc = await getDoc(userRef);
      return userDoc.exists() ? userDoc.data().customUID : null;
    } catch (error) {
      console.error('Error getting user custom UID:', error);
      throw new Error('Failed to get user custom UID');
    }
  };

  const value = {
    currentUser,
    userProfile,
    signInWithEmail,
    signUp,
    signInWithGoogle,
    signInWithFacebook,
    logout,
    getUserCustomUID
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}