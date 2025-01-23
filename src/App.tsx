import { useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { initializeAuth } from '@/contexts/AuthContext';
import { PrivateRoute } from './components/auth/PrivateRoute'; // Named export
import { LandingPage } from './pages/LandingPage'; // Named export
import { LoginPage } from './pages/LoginPage'; // Named export
import { SignupPage } from './pages/SignupPage'; // Named export
import { FriendsPage } from './pages/FriendsPage'; // Named export
import { RoomPage } from './pages/RoomPage'; // Named export
import { SettingsPage } from './pages/SettingsPage'; // Named export
import { ResetPasswordPage } from './pages/ResetPassword'; // Named export
import { ChatPage } from './pages/ChatPage'; // Named export
import { CreateRoomCard } from '@/components/rooms/CreateRoomDialog'; // Named export
import { JoinRoomCard } from './components/rooms/JoinRoomDialog'; // Named export
import ErrorBoundary  from './components/auth/ErrorBoundary'; // Named export

// Define the type for a route
interface RouteConfig {
  path: string;
  element: React.ReactNode;
  isPrivate: boolean;
}

// Define routes in a configuration object
const routes: RouteConfig[] = [
  { path: '/', element: <LandingPage />, isPrivate: false },
  { path: '/login', element: <LoginPage />, isPrivate: false },
  { path: '/signup', element: <SignupPage />, isPrivate: false },
  { path: '/reset-password', element: <ResetPasswordPage />, isPrivate: false },
  { path: '/friends', element: <FriendsPage />, isPrivate: true },
  { path: '/join', element: <JoinRoomCard />, isPrivate: true },
  { path: '/create', element: <CreateRoomCard />, isPrivate: true },
  { path: '/rooms/:id', element: <RoomPage />, isPrivate: true },
  { path: '/chat', element: <ChatPage />, isPrivate: true },
  { path: '/settings', element: <SettingsPage />, isPrivate: true },
];

function App() {
  const dispatch = useDispatch();

  // Memoize initializeAuth to avoid unnecessary re-renders
  const initializeAuthMemoized = useCallback(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  useEffect(() => {
    initializeAuthMemoized();
  }, [initializeAuthMemoized]);

  return (
    <Router>
      <ErrorBoundary>
        <Routes>
          {routes.map((route, index) => (
            <Route
              key={index}
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
        </Routes>
      </ErrorBoundary>
    </Router>
  );
}

export default App;