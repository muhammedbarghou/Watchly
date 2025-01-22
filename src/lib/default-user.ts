import { User } from 'firebase/auth';

export const defaultUser: User = {
  uid: 'test-user-123',
  email: 'test@example.com',
  displayName: 'Test User',
  emailVerified: true,
  isAnonymous: false,
  metadata: {
    creationTime: Date.now().toString(),
    lastSignInTime: Date.now().toString()
  },
  providerData: [],
  refreshToken: '',
  tenantId: null,
  delete: async () => { },
  getIdToken: async () => '',
  getIdTokenResult: async () => ({
    token: '',
    authTime: '',
    issuedAtTime: '',
    expirationTime: '',
    signInProvider: null,
    claims: {},
    signInSecondFactor: null
  }),
  reload: async () => { },
  toJSON: () => ({}),
  phoneNumber: null,
  photoURL: null,
  providerId: ''
};