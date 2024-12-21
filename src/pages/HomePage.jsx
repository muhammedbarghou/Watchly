import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bolt, LogOut, House, CirclePlus, HousePlus } from 'lucide-react';
import  Sidebar  from '../components/layout/Sidebar';
import { Header } from '../components/layout/Header';
import { MainContent } from '../components/layout/MainContent';

const HomePage = () => {
  const [activeComponent, setActiveComponent] = useState('home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState(() => 
    localStorage.getItem('theme') || 'light'
  );

  const navigate = useNavigate();

  const convertStringToTheme = (theme) => {
    switch (theme) {
      case 'light':
        return 'light';
      case 'dark':
        return 'dark';
      default:
        return 'light';
    }
  };



  const handleComponentChange = (component) => setActiveComponent(component);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const navigation = [
    {
      name: 'Home',
      icon: House,
      onClick: () => handleComponentChange('home')
    },
    {
      name: 'Create Room',
      icon: CirclePlus,
      onClick: () => handleComponentChange('createRoom')
    },
    {
      name: 'Join Room',
      icon: HousePlus,
      onClick: () => handleComponentChange('joinRoom')
    }
  ];

  return (
    <section className="flex flex-col h-screen w-screen relative overflow-hidden">
      <Sidebar
        isOpen={isSidebarOpen}
        currentTheme={currentTheme}
        navigation={navigation}
      />
      
      <div className={`flex-1 flex flex-col transition-transform duration-300 ease-in-out bg-gray-50 dark:bg-gray-950 ${
        isSidebarOpen ? "translate-x-64" : "translate-x-0"
      }`}>
        <Header
          isOpen={isSidebarOpen}
          activeComponent={activeComponent}
          onToggleSidebar={toggleSidebar}
        />
        <MainContent activeComponent={activeComponent} />
      </div>
    </section>
  );
};

export default HomePage;