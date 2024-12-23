import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import HomePage from './pages/HomePage';
import Room from './pages/Room';
import SignUp from './pages/SignUp';
import Login from './pages/Login';
import { PasswordResetFlow } from './components/password-reset/PasswordResetFlow';
import { Theme } from '@radix-ui/themes';
import '@radix-ui/themes/styles.css';
import SignMethode from './pages/SignMethode';

function App() {
  return (
    <Theme>
      <Router>
        <AppContent />
      </Router>
    </Theme>
  );
}

function AppContent() {
  const location = useLocation();
  React.useEffect(() => {
  }, [location]);

  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signmethode" element={<SignMethode />} />
        <Route path="/login" element={<Login />} />
        <Route path='Forgetpassword' element={<PasswordResetFlow />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/room" element={<Room />} />
      </Routes>
    </>
  );
}

export default App;
