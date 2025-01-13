import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { Button } from '../ui/button';
import { ChatEmoji } from './ChatEmoji';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
}

export function ChatInput({ onSendMessage }: ChatInputProps) {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setMessage((prev) => prev + emoji);
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t border-netflix-gray">
      <div className="flex gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Send a message..."
          className="flex-1 bg-netflix-black border border-netflix-gray rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-netflix-red"
          aria-label="Chat message"
        />
        <ChatEmoji onEmojiSelect={handleEmojiSelect} />
        <Button
          type="submit"
          disabled={!message.trim()}
          aria-label="Send message"
        >
          <Send className="w-5 h-5" />
        </Button>
      </div>
    </form>
  );
}