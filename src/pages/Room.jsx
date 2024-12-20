import React, { useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import * as ScrollArea from '@radix-ui/react-scroll-area';
import { VideoPlayer } from '../components/RoomPage/Video/VideoPlayer';
import MenuToggle from '../components/RoomPage/Room/MenuToggle';
import ChatMessage from '../components/RoomPage/Chat/ChatMessage';
import ChatInput from '../components/RoomPage/Chat/ChatInput';
import  Toast  from '../components/RoomPage/ui/Toast';
import Logo from '../Imgs/logo.png';

const Room = () => {
  const { id } = useParams();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const videoUrl = queryParams.get('videoLink');
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [toast, setToast] = useState({ open: false, message: '', type: 'info' });

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      setMessages([
        ...messages,
        {
          id: messages.length + 1,
          user: 'You',
          text: newMessage,
          avatar: 'https://api.uifaces.co/our-content/donated/xZ4wg2Xj.jpg',
        },
      ]);
      setNewMessage('');
    }
  };

  if (!videoUrl) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-4">Invalid Room URL</h1>
          <p>Please provide a valid video link in the URL parameters.</p>
        </div>
      </div>
    );
  }

  return (
    <main className="w-full h-screen flex flex-col overflow-hidden bg-gray-900">
      <nav className="h-16 w-full flex items-center justify-between bg-[#1c1c1c] px-4 md:px-6">
        <MenuToggle />
        <img src={Logo} alt="logo" className="h-8 md:h-10" />
        <div className="relative w-8 h-8 md:w-10 md:h-10 overflow-hidden bg-gray-100 rounded-full dark:bg-gray-600">
          <svg
            className="absolute w-10 h-10 md:w-12 md:h-12 text-gray-400 -left-1"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </nav>   
      <div className="w-full flex-1 flex flex-col lg:flex-row">
        <main className="w-full lg:w-2/3 h-[40vh] lg:h-full">
          <VideoPlayer url={videoUrl} />
        </main>

        <section className="w-full lg:w-1/3 h-[calc(100vh-64px)] flex flex-col bg-black">
          <header className="h-16 font-bold text-white p-4 border-b border-gray-800">
            <h2 className="text-xl">#CHAT</h2>
            <p className="text-sm text-gray-400">Room ID: {id}</p>
          </header>
          <ScrollArea.Root className="flex-1 h-[calc(100%-128px)]">
            <ScrollArea.Viewport className="h-full w-full p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <ChatMessage key={message.id} message={message} />
                ))}
              </div>
            </ScrollArea.Viewport>
            <ScrollArea.Scrollbar
              orientation="vertical"
              className="flex select-none touch-none p-0.5 bg-gray-800 transition-colors duration-150 ease-out hover:bg-gray-700"
            >
              <ScrollArea.Thumb className="flex-1 bg-gray-600 rounded-[10px] relative before:content-[''] before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:w-full before:h-full before:min-w-[44px] before:min-h-[44px]" />
            </ScrollArea.Scrollbar>
          </ScrollArea.Root>
          <ChatInput
            value={newMessage}
            onChange={setNewMessage}
            onSend={handleSendMessage}
          />
        </section>
      </div>
      <Toast
        message={toast.message}
        type={toast.type}
        open={toast.open}
        onOpenChange={(open) => setToast(prev => ({ ...prev, open }))}
      />
    </main>
  );
};

export default Room;