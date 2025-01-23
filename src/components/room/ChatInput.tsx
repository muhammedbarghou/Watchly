import React, { useState, useEffect, useRef } from 'react';
import { Send, Smile } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react'; // Add an emoji picker library

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isSending?: boolean; // Optional loading state
}

export function ChatInput({ onSendMessage, isSending = false }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
      setShowEmojiPicker(false); // Hide emoji picker after sending
    }
  };

  const handleEmojiClick = (emoji: any) => {
    setMessage((prev) => prev + emoji.emoji);
    inputRef.current?.focus(); // Focus the input after selecting an emoji
  };

  useEffect(() => {
    inputRef.current?.focus(); // Auto-focus the input on mount
  }, []);

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t border-netflix-gray">
      <div className="flex gap-2 relative">
        {/* Emoji Picker Button */}
        <button
          type="button"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="p-2 rounded-lg bg-netflix-gray text-white hover:bg-netflix-gray/80"
          aria-label="Open emoji picker"
        >
          <Smile className="w-5 h-5" />
        </button>

        {/* Emoji Picker */}
        {showEmojiPicker && (
          <div className="absolute bottom-12 left-0 z-10">
            <EmojiPicker
              onEmojiClick={handleEmojiClick}
              width="300px"
              height="350px"
            />
          </div>
        )}

        {/* Message Input */}
        <input
          ref={inputRef}
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Send a message..."
          className="flex-1 bg-netflix-black border border-netflix-gray rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-netflix-red"
          aria-label="Type your message"
          maxLength={500} // Add a character limit
        />

        {/* Send Button */}
        <button
          type="submit"
          className="p-2 rounded-lg bg-netflix-red text-white hover:bg-netflix-red/90 disabled:opacity-50"
          disabled={!message.trim() || isSending}
          aria-label="Send message"
        >
          {isSending ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Character Limit Warning */}
      {message.length >= 450 && (
        <p className="text-xs text-gray-500 mt-1">
          {500 - message.length} characters remaining
        </p>
      )}
    </form>
  );
}