import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { PrivateRoute } from './components/auth/PrivateRoute';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { FriendsPage } from './pages/FriendsPage';
import { RoomPage } from './pages/RoomPage';
import { SettingsPage } from './pages/SettingsPage';
import {ResetPasswordPage} from './pages/ResetPassword';
import {ChatPage} from './pages/ChatPage';
import { CreateRoomCard } from '@/components/rooms/CreateRoomDialog';
import { JoinRoomCard } from './components/rooms/JoinRoomDialog';


function App() {
  return (
    <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          
          {/* Protected routes */}
          <Route path="/friends" element={
            <PrivateRoute>
              <FriendsPage />
            </PrivateRoute>
          } />

          <Route path="/join" element={
            <PrivateRoute>
              <JoinRoomCard onSubmit={function (_data: { roomId: string; password?: string; }): void {
                throw new Error('Function not implemented.');
              } } />
            </PrivateRoute>
          } />
          <Route path="/create" element={
            <PrivateRoute>
              <CreateRoomCard onSubmit={function (_data: { name: string; videoUrl: string; password?: string; }): void {
                throw new Error('Function not implemented.');
              } } />
            </PrivateRoute>
          } />
          <Route path="/rooms/:id" element={
            <PrivateRoute>
              <RoomPage />
            </PrivateRoute>
          } />
          <Route path="/chat" element={
            <PrivateRoute>
              <ChatPage />
            </PrivateRoute>
          } />
          <Route path="/settings" element={
            <PrivateRoute>
              <SettingsPage />
            </PrivateRoute>
          } />
        </Routes>
    </Router>
  );
}

export default App;