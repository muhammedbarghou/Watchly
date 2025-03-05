import { useEffect, useCallback, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { initializeAuth } from '@/contexts/AuthContext';
import { useAppDispatch } from './store/Store';
import { PrivateRoute } from './components/auth/PrivateRoute';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { Hub } from './pages/HubPage';
import { RoomPage } from './pages/RoomPage';
import { SettingsPage } from './pages/SettingsPage';
import { ResetPasswordPage } from './pages/ResetPassword';
import { ChatPage } from './pages/ChatPage';
import { CreateRoomPage } from '@/pages/CreateRoomPage';
import  JoinRoomPage  from './pages/JoinRoomPage';
import ErrorBoundary from './components/auth/ErrorBoundary';
import { NotFoundPage } from './pages/NotFoundPage';
import { TermsOfServices } from './pages/TermsOfServices';
import FriendsPage from './pages/FriendsPage';
import FriendsList from './components/friends/FriendsList';
import Loader from './components/Loader';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Help from './pages/Help';

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  RESET_PASSWORD: '/reset-password',
  HUB: '/hub',
  FRIENDS: '/friends',
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
}

const routes: RouteConfig[] = [
  { path: ROUTES.HOME, element: <LandingPage />, isPrivate: false, title: 'Welcome' },
  { path: ROUTES.LOGIN, element: <LoginPage />, isPrivate: false, title: 'Login' },
  { path: ROUTES.SIGNUP, element: <SignupPage />, isPrivate: false, title: 'Sign Up' },
  { path: ROUTES.RESET_PASSWORD, element: <ResetPasswordPage />, isPrivate: false, title: 'Reset Password' },
  { path: ROUTES.HUB, element: <Hub />, isPrivate: true, title: 'Hub' },
  { path: ROUTES.FRIENDS, element: <FriendsPage />, isPrivate: true, title: 'Friends' },
  { path: ROUTES.FRIENDS_LIST, element: <FriendsList />, isPrivate: true, title: 'Friends List' },
  { path: ROUTES.JOIN_ROOM, element: <JoinRoomPage />, isPrivate: true, title: 'Join Room' },
  { path: ROUTES.CREATE_ROOM, element: <CreateRoomPage />, isPrivate: true, title: 'Create Room' },
  { path: ROUTES.ROOM, element: <RoomPage />, isPrivate: true, title: 'Room' },
  { path: ROUTES.CHAT, element: <ChatPage />, isPrivate: true, title: 'Chat' },
  { path: ROUTES.SETTINGS, element: <SettingsPage />, isPrivate: true, title: 'Settings' },
  { path: ROUTES.TERMS, element: <TermsOfServices />, isPrivate: false, title: 'Terms of Service' },
  { path: ROUTES.HELP, element: <Help />, isPrivate: true, title: 'Help'}
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
              <PrivateRoute>{route.element}</PrivateRoute>
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