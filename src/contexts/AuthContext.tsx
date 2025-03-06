import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signOut,
  updateProfile,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  getFirestore,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { auth } from '../lib/firebase';

interface SerializableTimestamp {
  seconds: number;
  nanoseconds: number;
}

const convertTimestampToSerializable = (timestamp: Timestamp | null): SerializableTimestamp | null => {
  if (!timestamp) return null;
  return {
    seconds: timestamp.seconds,
    nanoseconds: timestamp.nanoseconds,
  };
};

const convertDocToSerializable = (data: any): any => {
  if (!data) return data;
  
  const result: any = {};
  
  Object.keys(data).forEach(key => {
    const value = data[key];
    
    if (value instanceof Timestamp) {
      result[key] = convertTimestampToSerializable(value);
    } 
    else if (value && typeof value === 'object' && !Array.isArray(value)) {
      result[key] = convertDocToSerializable(value);
    } 
    else if (Array.isArray(value)) {
      result[key] = value.map(item => 
        item instanceof Timestamp 
          ? convertTimestampToSerializable(item) 
          : (item && typeof item === 'object' ? convertDocToSerializable(item) : item)
      );
    } 
    else {
      result[key] = value;
    }
  });
  
  return result;
};

interface UserProfile {
  uid: string;
  customUID: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  createdAt: SerializableTimestamp | null;  // Changed from Timestamp to SerializableTimestamp
  updatedAt: SerializableTimestamp | null;  // Changed from Timestamp to SerializableTimestamp
  lastSeen?: SerializableTimestamp | null;  // Added lastSeen as optional field
  provider: string;
  isOnline: boolean;
  friends: string[];
  friendRequests: string[];
  blockedUsers: string[];
}

interface SerializableUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  customUID?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  currentUser: SerializableUser | null;
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

export const createUserDocument = async (
  user: SerializableUser,
  customUID: string,
  provider: string,
  fullName?: string
): Promise<UserProfile> => {
  try {
    const firestoreUserProfile = {
      uid: user.uid,
      customUID,
      email: user.email,
      displayName: fullName || user.displayName,
      photoURL: user.photoURL,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      provider,
      isOnline: true,
      friends: [],
      friendRequests: [],
      blockedUsers: [],
    };
    
    await setDoc(doc(db, 'users', user.uid), firestoreUserProfile);
    
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    const userData = userDoc.data();
    
    if (!userData) {
      throw new Error('Failed to retrieve user document after creation');
    }
    
    return convertDocToSerializable(userData) as UserProfile;
  } catch (error) {
    console.error('Error creating user document:', error);
    throw new Error('Failed to create user document');
  }
};

export const initializeAuth = createAsyncThunk(
  'auth/initializeAuth',
  async (_, { rejectWithValue }) => {
    try {
      return new Promise<{ user: SerializableUser | null; userProfile: UserProfile | null }>(
        (resolve, reject) => {
          const unsubscribe = onAuthStateChanged(auth, async (user) => {
            unsubscribe();

            if (user) {
              try {
                const userDocRef = doc(db, 'users', user.uid);
                const userDoc = await getDoc(userDocRef);

                const serializableUser = {
                  uid: user.uid,
                  email: user.email,
                  displayName: user.displayName,
                  photoURL: user.photoURL,
                  emailVerified: user.emailVerified,
                };

                const userProfile = userDoc.exists() 
                  ? convertDocToSerializable(userDoc.data()) as UserProfile 
                  : null;

                resolve({
                  user: serializableUser,
                  userProfile: userProfile,
                });
              } catch (error) {
                console.error('Error fetching user profile:', error);
                reject(rejectWithValue('Failed to initialize auth'));
              }
            } else {
              resolve({ user: null, userProfile: null });
            }
          });
        }
      );
    } catch (error) {
      return rejectWithValue('Failed to initialize auth');
    }
  }
);

export const signInWithEmailThunk = createAsyncThunk(
  'auth/signInWithEmail',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));

      if (userDoc.exists()) {
        await setDoc(
          doc(db, 'users', result.user.uid),
          {
            isOnline: true,
            lastSeen: serverTimestamp(),
          },
          { merge: true }
        );
      }

      const serializableUser = {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL,
        emailVerified: result.user.emailVerified,
      };

      const updatedUserDoc = await getDoc(doc(db, 'users', result.user.uid));
      const userProfile = updatedUserDoc.exists() 
        ? convertDocToSerializable(updatedUserDoc.data()) as UserProfile 
        : null;

      return { user: serializableUser, userProfile };
    } catch (error) {
      return rejectWithValue('Failed to sign in with email');
    }
  }
);

export const signUpThunk = createAsyncThunk(
  'auth/signUp',
  async (
    { email, password, fullName }: { email: string; password: string; fullName?: string },
    { rejectWithValue }
  ) => {
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      const customUID = await generateUniqueUID();

      if (fullName) {
        await updateProfile(user, { displayName: fullName });
      }

      const serializableUser = {
        uid: user.uid,
        email: user.email,
        displayName: fullName || user.displayName,
        photoURL: user.photoURL,
        emailVerified: user.emailVerified,
      };

      const userProfile = await createUserDocument(serializableUser, customUID, 'email', fullName);
      return { user: serializableUser, userProfile };
    } catch (error) {
      return rejectWithValue('Failed to sign up');
    }
  }
);

const handleSocialSignIn = async (
  user: SerializableUser,
  provider: string
): Promise<{ user: SerializableUser; userProfile: UserProfile }> => {
  try {
    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);

    let firestoreUserProfile;
    if (!userDoc.exists()) {
      const customUID = await generateUniqueUID();
      firestoreUserProfile = await createUserDocument(user, customUID, provider);
    } else {
      // Update the lastSeen field
      await setDoc(
        userRef,
        {
          isOnline: true,
          lastSeen: serverTimestamp(),
        },
        { merge: true }
      );
      
      const updatedUserDoc = await getDoc(userRef);
      firestoreUserProfile = convertDocToSerializable(updatedUserDoc.data()) as UserProfile;
    }

    return { user, userProfile: firestoreUserProfile };
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

      const serializableUser = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        emailVerified: user.emailVerified,
      };

      const { userProfile } = await handleSocialSignIn(serializableUser, 'google');
      return { user: serializableUser, userProfile };
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

      const serializableUser = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        emailVerified: user.emailVerified,
      };

      const { userProfile } = await handleSocialSignIn(serializableUser, 'facebook');
      return { user: serializableUser, userProfile };
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
        await setDoc(
          doc(db, 'users', currentUser.uid),
          {
            isOnline: false,
            lastSeen: serverTimestamp(),
          },
          { merge: true }
        );
      }

      await signOut(auth);
    } catch (error) {
      return rejectWithValue('Failed to log out');
    }
  }
);

const initialState: AuthState = {
  isAuthenticated: false,
  currentUser: null,
  userProfile: null,
  loading: true,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(initializeAuth.pending, (state) => {
        state.loading = true;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.currentUser = action.payload.user;
        state.userProfile = action.payload.userProfile;
        state.isAuthenticated = !!action.payload.user;
        state.loading = false;
      })
      .addCase(initializeAuth.rejected, (state) => {
        state.loading = false;
      })
      .addCase(signInWithEmailThunk.fulfilled, (state, action) => {
        state.currentUser = action.payload.user;
        state.userProfile = action.payload.userProfile;
        state.isAuthenticated = true;
        state.loading = false;
      })
      .addCase(signUpThunk.fulfilled, (state, action) => {
        state.currentUser = action.payload.user;
        state.userProfile = action.payload.userProfile;
        state.isAuthenticated = true;
        state.loading = false;
      })
      .addCase(signInWithGoogleThunk.fulfilled, (state, action) => {
        state.currentUser = action.payload.user;
        state.userProfile = action.payload.userProfile;
        state.isAuthenticated = true;
        state.loading = false;
      })
      .addCase(signInWithFacebookThunk.fulfilled, (state, action) => {
        state.currentUser = action.payload.user;
        state.userProfile = action.payload.userProfile;
        state.isAuthenticated = true;
        state.loading = false;
      })
      .addCase(logoutThunk.fulfilled, (state) => {
        state.currentUser = null;
        state.userProfile = null;
        state.isAuthenticated = false;
        state.loading = false;
      })
      .addMatcher(
        (action) => action.type.endsWith('/pending'),
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) => action.type.endsWith('/rejected'),
        (state, action) => {
          state.loading = false;
          state.error = (action as any).payload as string;
        }
      );
  },
});

export default authSlice.reducer;