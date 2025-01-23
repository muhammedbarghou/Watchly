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

interface SerializableUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
}

interface AuthState {
  isAuthenticated: boolean;
  currentUser: SerializableUser | null;
  userProfile: UserProfile | null;
  loading: boolean; // Add a loading state
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
      blockedUsers: [],
    };
    await setDoc(doc(db, 'users', user.uid), userProfile);
    return userProfile;
  } catch (error) {
    console.error('Error creating user document:', error);
    throw new Error('Failed to create user document');
  }
};

export const initializeAuth = createAsyncThunk(
  'auth/initializeAuth',
  async (_, { rejectWithValue }) => {
    return new Promise<{ user: SerializableUser | null; userProfile: UserProfile | null }>(
      (resolve, reject) => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
          unsubscribe();

          if (user) {
            try {
              const userDocRef = doc(db, 'users', user.uid);
              const userDoc = await getDoc(userDocRef);

              // Extract serializable user data
              const serializableUser = {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL,
                emailVerified: user.emailVerified,
              };

              resolve({
                user: serializableUser,
                userProfile: userDoc.exists() ? (userDoc.data() as UserProfile) : null,
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

      // Extract serializable user data
      const serializableUser = {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL,
        emailVerified: result.user.emailVerified,
      };

      return serializableUser;
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

      // Extract serializable user data
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

    let userProfile: UserProfile;
    if (!userDoc.exists()) {
      const customUID = await generateUniqueUID();
      userProfile = await createUserDocument(user, customUID, provider);
    } else {
      await setDoc(
        userRef,
        {
          isOnline: true,
          lastSeen: serverTimestamp(),
        },
        { merge: true }
      );
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

      // Extract serializable user data
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

      // Extract serializable user data
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
  loading: true, // Initialize as true
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(initializeAuth.pending, (state) => {
        state.loading = true; // Set loading to true while initializing
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.currentUser = action.payload.user;
        state.userProfile = action.payload.userProfile;
        state.isAuthenticated = !!action.payload.user;
        state.loading = false; // Set loading to false after initialization
      })
      .addCase(initializeAuth.rejected, (state) => {
        state.loading = false; // Set loading to false if initialization fails
      })
      .addCase(signInWithEmailThunk.fulfilled, (state, action) => {
        state.currentUser = action.payload;
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