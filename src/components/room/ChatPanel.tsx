import React from 'react';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { ArrowDown } from 'lucide-react'; // For scroll-to-bottom button

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
  isLoading?: boolean; // Optional loading state
}

export function ChatPanel({ messages, onSendMessage, currentUser, isLoading }: ChatPanelProps) {
  const chatRef = React.useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = React.useState(false);

  // Scroll to bottom when new messages are added
  React.useEffect(() => {
    if (chatRef.current) {
      const isScrolledToBottom =
        chatRef.current.scrollHeight - chatRef.current.scrollTop <= chatRef.current.clientHeight + 50;
      if (isScrolledToBottom) {
        chatRef.current.scrollTop = chatRef.current.scrollHeight;
      } else {
        setShowScrollButton(true);
      }
    }
  }, [messages]);

  // Handle scroll events
  const handleScroll = () => {
    if (chatRef.current) {
      const isScrolledToBottom =
        chatRef.current.scrollHeight - chatRef.current.scrollTop <= chatRef.current.clientHeight + 50;
      setShowScrollButton(!isScrolledToBottom);
    }
  };

  // Scroll to bottom manually
  const scrollToBottom = () => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
      setShowScrollButton(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-netflix-black border-l border-netflix-gray">
      {/* Chat Header */}
      <div className="p-4 border-b border-netflix-gray">
        <h2 className="font-semibold text-white">Chat</h2>
      </div>

      {/* Chat Messages */}
      <div
        ref={chatRef}
        className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-netflix-gray"
        onScroll={handleScroll}
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message, index) => {
            const isSameUser = index > 0 && messages[index - 1].username === message.username;
            return (
              <ChatMessage
                key={message.id}
                username={message.username}
                message={message.message}
                timestamp={message.timestamp}
                isOwn={message.username === currentUser}
                showAvatar={!isSameUser} // Hide avatar for consecutive messages by the same user
              />
            );
          })
        )}
      </div>

      {/* Scroll-to-bottom Button */}
      {showScrollButton && (
        <button
          onClick={scrollToBottom}
          className="fixed bottom-20 right-4 p-2 bg-netflix-red text-white rounded-full hover:bg-netflix-red/90 transition-colors"
          aria-label="Scroll to bottom"
        >
          <ArrowDown className="w-5 h-5" />
        </button>
      )}

      {/* Chat Input */}
      <ChatInput onSendMessage={onSendMessage} />
    </div>
  );
}