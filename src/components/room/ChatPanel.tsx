import React from 'react';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';

interface Message {
  id: string;
  username: string;
  message: string;
  timestamp: Date;
}

interface ChatPanelProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  currentUser: string;
}

export function ChatPanel({ messages, onSendMessage, currentUser }: ChatPanelProps) {
  const chatRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-full bg-netflix-black border-l border-netflix-gray">
      <div className="p-4 border-b border-netflix-gray">
        <h2 className="font-semibold text-white">Chat</h2>
      </div>

      <div 
        ref={chatRef}
        className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-netflix-gray"
      >
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            username={message.username}
            message={message.message}
            timestamp={message.timestamp}
            isOwn={message.username === currentUser}
          />
        ))}
      </div>

      <ChatInput onSendMessage={onSendMessage} />
    </div>
  );
}