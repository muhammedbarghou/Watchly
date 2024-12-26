import React from 'react';
import  Home  from '../HomePage/Home';
import  CreateRoom  from '../HomePage/CreateRoom';
import  JoinRoom  from '../HomePage/JoinRoom';
import  Settings  from '../HomePage/Settings';

export const MainContent = ({ activeComponent }) => {
  const components = {
    home: Home,
    createRoom: CreateRoom,
    joinRoom: JoinRoom,
    settings: Settings,
  };

  const Component = components[activeComponent];

  return (
    <main className="bg-transparent w-full h-auto z-10">
      {Component && <Component />}
    </main>
  );
};