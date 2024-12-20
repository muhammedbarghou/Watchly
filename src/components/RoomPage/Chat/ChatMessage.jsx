import React from 'react'

const ChatMessage = ({ message }) => {
  const isCurrentUser = message.user === 'You';

  return (
    <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-lg ms-auto flex gap-x-2 sm:gap-x-4 ${
          isCurrentUser
            ? 'inline-block bg-blue-600 rounded-2xl p-4 shadow-sm'
            : 'inline-block bg-white rounded-2xl p-4 shadow-sm'
        }`}
      >
        <img src={message.avatar} className="flex-none w-12 h-12 rounded-full" alt={message.user} />
        <p className={isCurrentUser ? 'text-white' : 'text-gray-800'}>{message.text}</p>
      </div>
    </div>
  );
};

export default ChatMessage;
