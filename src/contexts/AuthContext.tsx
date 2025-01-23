import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { 
  User,
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signOut,
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

interface AuthState {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  error: string | null;
}

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

export const createUserDocument = async (user: User, customUID: string, provider: string, fullName?: string): Promise<UserProfile> => {
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

export const signInWithEmailThunk = createAsyncThunk(
  'auth/signInWithEmail',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      
      if (userDoc.exists()) {
        await setDoc(doc(db, 'users', result.user.uid), {
          isOnline: true,
          lastSeen: serverTimestamp()
        }, { merge: true });
      }
      
      return result.user;
    } catch (error) {
      return rejectWithValue('Failed to sign in with email');
    }
  }
);

export const signUpThunk = createAsyncThunk(
  'auth/signUp',
  async ({ email, password, fullName }: { email: string; password: string; fullName?: string }, { rejectWithValue }) => {
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      const customUID = await generateUniqueUID();
      
      if (fullName) {
        await updateProfile(user, { displayName: fullName });
      }
      
      const userProfile = await createUserDocument(user, customUID, 'email', fullName);
      return { user, userProfile };
    } catch (error) {
      return rejectWithValue('Failed to sign up');
    }
  }
);

const handleSocialSignIn = async (user: User, provider: string): Promise<{ user: User; userProfile: UserProfile }> => {
  try {
    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);
    
    let userProfile: UserProfile;
    if (!userDoc.exists()) {
      const customUID = await generateUniqueUID();
      userProfile = await createUserDocument(user, customUID, provider);
    } else {
      await setDoc(userRef, {
        isOnline: true,
        lastSeen: serverTimestamp()
      }, { merge: true });
      userProfile = userDoc.data() as UserProfile;
    }
    
    return { user, userProfile };
  } catch (error) {
    throw new Error('Failed to handle social sign-in');
  }
};

export const signInWithGoogleThunk = createAsyncThunk(
  'auth/signInWithGoogle',
  async (_, { rejectWithValue }) => {
    try {
      const provider = new GoogleAuthProvider();
      const { user } = await signInWithPopup(auth, provider);
      const { userProfile } = await handleSocialSignIn(user, 'google');
      return { user, userProfile };
    } catch (error) {
      return rejectWithValue('Failed to sign in with Google');
    }
  }
);

export const signInWithFacebookThunk = createAsyncThunk(
  'auth/signInWithFacebook',
  async (_, { rejectWithValue }) => {
    try {
      const provider = new FacebookAuthProvider();
      const { user } = await signInWithPopup(auth, provider);
      const { userProfile } = await handleSocialSignIn(user, 'facebook');
      return { user, userProfile };
    } catch (error) {
      return rejectWithValue('Failed to sign in with Facebook');
    }
  }
);

export const logoutThunk = createAsyncThunk(
  'auth/logout',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: AuthState };
      const currentUser = state.auth.currentUser;
      
      if (currentUser) {
        await setDoc(doc(db, 'users', currentUser.uid), {
          isOnline: false,
          lastSeen: serverTimestamp()
        }, { merge: true });
      }
      
      await signOut(auth);
    } catch (error) {
      return rejectWithValue('Failed to log out');
    }
  }
);

const initialState: AuthState = {
  currentUser: null,
  userProfile: null,
  loading: false,
  error: null
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Sign In with Email
    builder.addCase(signInWithEmailThunk.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(signInWithEmailThunk.fulfilled, (state, action) => {
      state.currentUser = action.payload;
      state.loading = false;
    });
    builder.addCase(signInWithEmailThunk.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Sign Up
    builder.addCase(signUpThunk.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(signUpThunk.fulfilled, (state, action) => {
      state.currentUser = action.payload.user;
      state.userProfile = action.payload.userProfile;
      state.loading = false;
    });
    builder.addCase(signUpThunk.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Sign In with Google
    builder.addCase(signInWithGoogleThunk.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(signInWithGoogleThunk.fulfilled, (state, action) => {
      state.currentUser = action.payload.user;
      state.userProfile = action.payload.userProfile;
      state.loading = false;
    });
    builder.addCase(signInWithGoogleThunk.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Sign In with Facebook
    builder.addCase(signInWithFacebookThunk.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(signInWithFacebookThunk.fulfilled, (state, action) => {
      state.currentUser = action.payload.user;
      state.userProfile = action.payload.userProfile;
      state.loading = false;
    });
    builder.addCase(signInWithFacebookThunk.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Logout
    builder.addCase(logoutThunk.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(logoutThunk.fulfilled, (state) => {
      state.currentUser = null;
      state.userProfile = null;
      state.loading = false;
    });
    builder.addCase(logoutThunk.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  }
});

export default authSlice.reducer;