import { useState } from 'react';
import { MainLayout } from '../components/layout/MainLayout';
import { Sidebar } from '@/components/chat/ChatSideBar';
import { ChatSection } from '@/components/chat/ChatSection';

const chatData = {
  'office-chat': {
    id: 'FRIENDS',
    name: 'Friends',
    members: '45 members, 25 online',
    messages: [
      { id: 1, sender: 'Frank Garcia', content: "We will start celebrating Greg's birthday soon", time: '08:57' },
      { id: 2, sender: 'Jenny Li', content: "We're already starting, hurry up if it's late", time: '09:01' },
      { id: 3, sender: 'Liz Wilson', content: "I'm stuck in traffic, I'll be there a little late", time: '09:05' }
    ]
  }
};

export function ChatPage() {
  const [selectedChat] = useState<{
    id: string;
    name: string;
    members?: string;
    messages: {
      id: number;
      sender: string;
      content: string;
      time: string;
    }[];
  } | null>(chatData['office-chat']);

  return (
    <MainLayout>
      <div className="flex h-full">
        <div className="border-r">
          <Sidebar onChatSelect={() => {}} selectedChat={selectedChat} />
        </div>
        <div className="overflow-hidden w-full">
          <ChatSection chat={selectedChat} />
        </div>
      </div>
    </MainLayout>
  );
}

export default ChatPage;