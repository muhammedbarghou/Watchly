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
  collection,
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
  createdAt: any;
  updatedAt: any;
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

  // Fetch user profile when auth state changes
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
  };

  // Helper function to generate search terms
  const generateSearchTerms = (displayName: string): string[] => {
    const terms = displayName.toLowerCase().split(' ');
    const searchTerms: string[] = [];
    
    terms.forEach(term => {
      for (let i = 1; i <= term.length; i++) {
        searchTerms.push(term.substring(0, i));
      }
    });
    
    return searchTerms;
  };

  const signInWithEmail = async (email: string, password: string) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    const userDoc = await getDoc(doc(db, 'users', result.user.uid));
    if (userDoc.exists()) {
      await setDoc(doc(db, 'users', result.user.uid), {
        isOnline: true,
        lastSeen: serverTimestamp()
      }, { merge: true });
    }
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    const customUID = await generateUniqueUID();
    
    if (fullName) {
      await updateProfile(user, { displayName: fullName });
    }
    
    const userProfile = await createUserDocument(user, customUID, 'email', fullName);
    setUserProfile(userProfile);
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
    const provider = new GoogleAuthProvider();
    const { user } = await signInWithPopup(auth, provider);
    const customUID = await handleSocialSignIn(user, 'google');
    return { customUID };
  };

  const signInWithFacebook = async () => {
    const provider = new FacebookAuthProvider();
    const { user } = await signInWithPopup(auth, provider);
    const customUID = await handleSocialSignIn(user, 'facebook');
    return { customUID };
  };

  const logout = async () => {
    if (currentUser) {
      await setDoc(doc(db, 'users', currentUser.uid), {
        isOnline: false,
        lastSeen: serverTimestamp()
      }, { merge: true });
    }
    await signOut(auth);
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