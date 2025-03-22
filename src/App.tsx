import { useEffect, useCallback, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { initializeAuth } from '@/contexts/AuthContext';
import { useAppDispatch } from './store/Store';
import { PrivateRoute } from './components/auth/PrivateRoute';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { HubPage } from './pages/HubPage';
import RoomPage from './pages/RoomPage';
import { SettingsPage } from './pages/SettingsPage';
import { ResetPasswordPage } from './pages/ResetPassword';
import { ChatPage } from './pages/ChatPage';
import { CreateRoomPage } from '@/pages/CreateRoomPage';
import JoinRoomPage from './pages/JoinRoomPage';
import ErrorBoundary from './components/auth/ErrorBoundary';
import { NotFoundPage } from './pages/NotFoundPage';
import { TermsOfServices } from './pages/TermsOfServices';
import FriendsList from './pages/FriendsList';
import Loader from './components/Loader';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Help from './pages/Help';
import { VerifyEmail } from './components/auth/VerifyEmail';

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  RESET_PASSWORD: '/reset-password',
  VERIFY_EMAIL: '/verify-email',
  HUB: '/hub',
  FRIENDS_LIST: '/friends-list',
  JOIN_ROOM: '/join',
  CREATE_ROOM: '/create',
  ROOM: '/room/:roomId',
  CHAT: '/chat',
  SETTINGS: '/settings',
  TERMS: '/terms-of-services',
  HELP: '/help',
} as const;

type RouteKeys = keyof typeof ROUTES;
type RoutePaths = typeof ROUTES[RouteKeys];

interface RouteConfig {
  path: RoutePaths;
  element: React.ReactNode;
  isPrivate: boolean;
  title: string;
  requiresEmailVerification?: boolean;
}

const routes: RouteConfig[] = [
  { path: ROUTES.HOME, element: <LandingPage />, isPrivate: false, title: 'Welcome' },
  { path: ROUTES.LOGIN, element: <LoginPage />, isPrivate: false, title: 'Login' },
  { path: ROUTES.SIGNUP, element: <SignupPage />, isPrivate: false, title: 'Sign Up' },
  { path: ROUTES.RESET_PASSWORD, element: <ResetPasswordPage />, isPrivate: false, title: 'Reset Password' },
  { path: ROUTES.VERIFY_EMAIL, element: <VerifyEmail />, isPrivate: false, title: 'Verify Email' },
  { path: ROUTES.HUB, element: <HubPage />, isPrivate: true, title: 'Hub', requiresEmailVerification: true },
  { path: ROUTES.FRIENDS_LIST, element: <FriendsList />, isPrivate: true, title: 'Friends List', requiresEmailVerification: true },
  { path: ROUTES.JOIN_ROOM, element: <JoinRoomPage />, isPrivate: true, title: 'Join Room', requiresEmailVerification: true },
  { path: ROUTES.CREATE_ROOM, element: <CreateRoomPage />, isPrivate: true, title: 'Create Room', requiresEmailVerification: true },
  { path: ROUTES.ROOM, element: <RoomPage />, isPrivate: true, title: 'Room', requiresEmailVerification: true },
  { path: ROUTES.CHAT, element: <ChatPage />, isPrivate: true, title: 'Chat', requiresEmailVerification: true },
  { path: ROUTES.SETTINGS, element: <SettingsPage />, isPrivate: true, title: 'Settings', requiresEmailVerification: true },
  { path: ROUTES.TERMS, element: <TermsOfServices />, isPrivate: false, title: 'Terms of Service' },
  { path: ROUTES.HELP, element: <Help />, isPrivate: true, title: 'Help', requiresEmailVerification: true }
];

const AppRoutes = () => {
  useEffect(() => {
    const currentRoute = routes.find(route => 
      window.location.pathname === route.path || 
      (route.path.includes(':') && window.location.pathname.startsWith(route.path.split(':')[0]))
    );
    if (currentRoute) {
      document.title = `Watchly - ${currentRoute.title}`;
    }
  }, []);

  return (
    <Routes>
      {routes.map((route) => (
        <Route
          key={route.path}
          path={route.path}
          element={
            route.isPrivate ? (
              <PrivateRoute requiresEmailVerification={route.requiresEmailVerification}>
                {route.element}
              </PrivateRoute>
            ) : (
              route.element
            )
          }
        />
      ))}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

const AppContent = () => {
  const dispatch = useAppDispatch();
  const [isAuthInitialized, setIsAuthInitialized] = useState(false);
  const [initError, setInitError] = useState<Error | null>(null);

  const initializeAuthMemoized = useCallback(async () => {
    try {
      await dispatch(initializeAuth());
      setIsAuthInitialized(true);
    } catch (error) {
      setInitError(error instanceof Error ? error : new Error('Failed to initialize auth'));
    }
  }, [dispatch]);

  useEffect(() => {
    initializeAuthMemoized();
  }, [initializeAuthMemoized]);

  if (initError) {
    return (
      <Alert variant="destructive" className="m-4">
        <AlertDescription>
          Failed to initialize application: {initError.message}
        </AlertDescription>
      </Alert>
    );
  }

  if (!isAuthInitialized) {
    return <Loader />;
  }

  return <AppRoutes />;
};

function App() {
  return (
    <Router>
      <ErrorBoundary>
        <AppContent />
      </ErrorBoundary>
    </Router>
  );
}

export default App;