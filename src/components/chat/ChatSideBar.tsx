import { Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SidebarProps {
  onChatSelect: (chatId: string) => void;
  selectedChat: { id: string; name: string; members?: string; messages: { id: number; sender: string; content: string; time: string }[] } | null;
}

export function Sidebar({ onChatSelect, selectedChat }: SidebarProps) {
  const chatItems = [
    { id: 'office-chat', name: 'Office chat', message: '', time: '4', isGroup: true }
  ];

  return (
    <div 
      className="dark:bg-netflix-black w-80 flex flex-col"
    >
      <div className="relative mb-4">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search" className="pl-8" />
      </div>

      <ScrollArea className="h-full">
        {chatItems.map((chat) => (
          <motion.div
            key={chat.id}
            whileHover={{ backgroundColor: 'rgba(0,0,0,0.05)' }}
            className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer ${
              selectedChat?.id === chat.id ? 'bg-primary/10' : ''
            }`}
            onClick={() => onChatSelect(chat.id)}
          >
            <Avatar>
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                {chat.isGroup ? '👥' : '👤'}
              </div>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center">
                <p className="font-medium truncate">{chat.name}</p>
                <span className="text-xs text-muted-foreground">{chat.time}</span>
              </div>
              <p className="text-sm text-muted-foreground truncate">{chat.message}</p>
            </div>
          </motion.div>
        ))}
      </ScrollArea>
    </div>
  );
};