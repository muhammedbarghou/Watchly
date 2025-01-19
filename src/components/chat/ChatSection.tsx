import React from 'react';
import { motion } from 'framer-motion';
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ChatSectionProps {
  chat: { id: string; name: string; members?: string; messages: { id: number; sender: string; content: string; time: string }[] } | null;
}
export const ChatSection: React.FC<ChatSectionProps> = ({ chat }) => {
  if (!chat) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-muted-foreground">Select a chat to start messaging</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex-1 flex flex-col h-full"
    >
      <div className="border-b p-4 flex justify-between items-center h-1/5">
        <div className="flex items-center gap-3">
          <Avatar>
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              {chat.id === 'office-chat' ? '👥' : '👤'}
            </div>
          </Avatar>
          <div>
            <h2 className="font-semibold">{chat.name}</h2>
            {chat.members && <p className="text-sm text-muted-foreground">{chat.members}</p>}
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4 h-80">
        {chat.messages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mb-4"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium">{message.sender}</span>
              <span className="text-xs text-muted-foreground">{message.time}</span>
            </div>
            <p className="text-sm">{message.content}</p>
          </motion.div>
        ))}
      </ScrollArea>

      <div className="border-t p-4 mt-auto">
        <Input placeholder="Your message" className="w-full h-1/5" />
      </div>
    </motion.div>
  );
};
