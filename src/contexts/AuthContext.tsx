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
  sendEmailVerification as firebaseSendEmailVerification,
  applyActionCode,
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
  createdAt: SerializableTimestamp | null;  
  updatedAt: SerializableTimestamp | null;  
  lastSeen?: SerializableTimestamp | null;  
  provider: string;
  isOnline: boolean;
  friends: string[];
  friendRequests: string[];
  blockedUsers: string[];
  emailVerified: boolean; // Added emailVerified field
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
      emailVerified: user.emailVerified, // Add email verification status
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

                let userProfile = userDoc.exists() 
                  ? convertDocToSerializable(userDoc.data()) as UserProfile 
                  : null;
                
                // Update emailVerified status in database if it has changed
                if (userProfile && userProfile.emailVerified !== user.emailVerified) {
                  await setDoc(
                    doc(db, 'users', user.uid),
                    { emailVerified: user.emailVerified },
                    { merge: true }
                  );
                  
                  // Refresh user profile data
                  const updatedUserDoc = await getDoc(userDocRef);
                  userProfile = updatedUserDoc.exists() 
                    ? convertDocToSerializable(updatedUserDoc.data()) as UserProfile 
                    : null;
                }

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
      
      // Check if email is verified
      if (!result.user.emailVerified) {
        await signOut(auth);
        return rejectWithValue('Please verify your email before signing in. Check your inbox for a verification link.');
      }
      
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));

      if (userDoc.exists()) {
        await setDoc(
          doc(db, 'users', result.user.uid),
          {
            isOnline: true,
            lastSeen: serverTimestamp(),
            emailVerified: result.user.emailVerified, // Update verification status
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
    } catch (error: any) {
      let message = 'Failed to sign in with email';
      
      // Handle specific Firebase error codes
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        message = 'Invalid email or password';
      } else if (error.code === 'auth/too-many-requests') {
        message = 'Too many unsuccessful login attempts. Please try again later.';
      }
      
      return rejectWithValue(message);
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
      
      // Don't send verification email here - we'll do it in a separate action
      
      return { user: serializableUser, userProfile };
    } catch (error: any) {
      let message = 'Failed to sign up';
      
      // Handle specific Firebase error codes
      if (error.code === 'auth/email-already-in-use') {
        message = 'This email is already registered. Please use a different email or try logging in.';
      } else if (error.code === 'auth/invalid-email') {
        message = 'Invalid email format. Please enter a valid email address.';
      } else if (error.code === 'auth/weak-password') {
        message = 'Password is too weak. Please use a stronger password.';
      }
      
      return rejectWithValue(message);
    }
  }
);

// New thunk to send email verification
export const sendEmailVerificationThunk = createAsyncThunk(
  'auth/sendEmailVerification',
  async (_, { getState, rejectWithValue }) => {
    try {
      const currentUser = auth.currentUser;
      
      if (!currentUser) {
        return rejectWithValue('No user is currently signed in');
      }
      
      await firebaseSendEmailVerification(currentUser);
      return true;
    } catch (error: any) {
      console.error('Error sending verification email:', error);
      return rejectWithValue('Failed to send verification email. Please try again later.');
    }
  }
);

// New thunk to verify email with action code
export const verifyEmailThunk = createAsyncThunk(
  'auth/verifyEmail',
  async (actionCode: string, { rejectWithValue }) => {
    try {
      await applyActionCode(auth, actionCode);
      
      // Reload the user to get updated emailVerified status
      if (auth.currentUser) {
        await auth.currentUser.reload();
        
        // Update the user profile in Firestore
        if (auth.currentUser.uid) {
          await setDoc(
            doc(db, 'users', auth.currentUser.uid),
            { emailVerified: true },
            { merge: true }
          );
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error verifying email:', error);
      return rejectWithValue('Failed to verify email. The link may be invalid or expired.');
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
      // Update the lastSeen field and emailVerified status
      await setDoc(
        userRef,
        {
          isOnline: true,
          lastSeen: serverTimestamp(),
          emailVerified: user.emailVerified,
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
      
      // For Google sign-in, we typically don't need to verify the email
      // as Google has already verified it, but we can check if needed
      if (!user.emailVerified) {
        await firebaseSendEmailVerification(user);
        return rejectWithValue('Please verify your email before signing in. Check your inbox for a verification link.');
      }
      
      return { user: serializableUser, userProfile };
    } catch (error: any) {
      let message = 'Failed to sign in with Google';
      
      if (error.code === 'auth/popup-closed-by-user') {
        message = 'Sign in was cancelled. Please try again.';
      }
      
      return rejectWithValue(message);
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
      
      // For Facebook sign-in, we might need to verify the email if Facebook didn't
      if (!user.emailVerified && user.email) {
        await firebaseSendEmailVerification(user);
        return rejectWithValue('Please verify your email before signing in. Check your inbox for a verification link.');
      }
      
      return { user: serializableUser, userProfile };
    } catch (error: any) {
      let message = 'Failed to sign in with Facebook';
      
      if (error.code === 'auth/popup-closed-by-user') {
        message = 'Sign in was cancelled. Please try again.';
      }
      
      return rejectWithValue(message);
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
  reducers: {
    clearAuthError: (state) => {
      state.error = null;
    }
  },
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
      .addCase(sendEmailVerificationThunk.fulfilled, (state) => {
        // No need to update state here
      })
      .addCase(verifyEmailThunk.fulfilled, (state) => {
        // Update the email verification status if the user is already logged in
        if (state.currentUser) {
          state.currentUser.emailVerified = true;
        }
        if (state.userProfile) {
          state.userProfile.emailVerified = true;
        }
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

export const { clearAuthError } = authSlice.actions;
export default authSlice.reducer;