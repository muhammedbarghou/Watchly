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
import { CreateRoomCard } from '@/components/rooms/CreateRoomDialog'; 
import { JoinRoomCard } from './components/rooms/JoinRoomDialog'; 
import ErrorBoundary from './components/auth/ErrorBoundary'; 
import { NotFoundPage } from './pages/NotFoundPage'; 
import {TermsOfServices} from './pages/TermsOfServices';
import FriendsPage from './pages/FriendsPage';
import FriendsList from './components/friends/FriendsList';
import Loader from './components/Loader';

interface RouteConfig {
  path: string;
  element: React.ReactNode;
  isPrivate: boolean;
}

const routes: RouteConfig[] = [
  { path: '/', element: <LandingPage />, isPrivate: false },
  { path: '/login', element: <LoginPage />, isPrivate: false },
  { path: '/signup', element: <SignupPage />, isPrivate: false },
  { path: '/reset-password', element: <ResetPasswordPage />, isPrivate: false },
  { path: '/hub', element: <Hub />, isPrivate: true },
  {path: '/friends', element: <FriendsPage />, isPrivate: true},
  {path: '/friends-list', element: <FriendsList />, isPrivate: true},
  { path: '/join', element: <JoinRoomCard />, isPrivate: true },
  { path: '/create', element: <CreateRoomCard />, isPrivate: true },
  { path: '/rooms/:id', element: <RoomPage />, isPrivate: true },
  { path: '/chat', element: <ChatPage />, isPrivate: true },
  { path: '/settings', element: <SettingsPage />, isPrivate: true },
  {path : '/terms-of-services', element: <TermsOfServices />, isPrivate: false},
  { path: '*', element: <NotFoundPage />, isPrivate: false }, 
];

function App() {
  const dispatch = useAppDispatch(); 
  const [isAuthInitialized, setIsAuthInitialized] = useState(false);

  const initializeAuthMemoized = useCallback(async () => {
    await dispatch(initializeAuth());
    setIsAuthInitialized(true); 
  }, [dispatch]);

  useEffect(() => {
    initializeAuthMemoized();
  }, [initializeAuthMemoized]);

  if (!isAuthInitialized) {
    return <Loader/>;
  }

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