import { SendHorizontal } from 'lucide-react';
import React from 'react';

const ChatInput = ({ value, onChange, onSend }) => {
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      onSend();
    }
  };

  return (
    <div className="flex items-center h-10 w-full">
      <input
        type="text"
        placeholder="Send a message"
        value={value}
        className="flex-1 p-2 text-sm md:text-base border-none bg-gray-700 text-white focus:outline-none"
        onChange={(e) => onChange(e.target.value)}
        onKeyPress={handleKeyPress}
      />
      <button
        onClick={onSend}
        className="bg-[#d00000] text-white px-4 py-2 text-sm md:text-base cursor-pointer transition-colors duration-300 hover:bg-[#6A040F]"
      >
        <SendHorizontal />
      </button>
    </div>
  );
};

export default ChatInput;