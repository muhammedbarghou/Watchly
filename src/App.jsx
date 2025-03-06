import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './components/HomePage/HomePage';
import MainPage from './components/MainPage/MainPage';
import RoomsPage from './components/RoomsPage/RoomsPage';
import SettingsPage from './components/SettingsPage/SettingsPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/rooms" element={<RoomsPage />} />
        <Route path="/gin" element={<SettingsPage />} />
      </Routes>
    </Router>
  );
}

export default App;