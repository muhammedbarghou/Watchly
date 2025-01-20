import { Search, Users, MessageSquare, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
interface ChatItem {
  id: string;
  name: string;
  message: string;
  time: string;
  isGroup: boolean;
  unreadCount?: number;
  status?: 'online' | 'offline';
}

interface SidebarProps {
  onChatSelect: (chatId: string) => void;
  selectedChat: { 
    id: string; 
    name: string; 
    members?: string; 
    messages: { 
      id: number; 
      sender: string; 
      content: string; 
      time: string 
    }[] 
  } | null;
}

export function Sidebar({ onChatSelect, selectedChat }: SidebarProps) {
  // Example data - in real app, this would come from props or API
  const chatItems: ChatItem[] = [
    { 
      id: 'Friends', 
      name: 'Friends', 
      message: 'Latest project updates...', 
      time: '4m', 
      isGroup: true,
      unreadCount: 3,
      status: 'online'
    },
    { 
      id: 'Family', 
      name: 'Family', 
      message: 'How are you doing?', 
      time: '1h', 
      isGroup: true,
      unreadCount: 1
    },
    { 
      id: 'JohnDoe', 
      name: 'John Doe', 
      message: 'Hey, how are you?', 
      time: '2h', 
      isGroup: false,
      status: 'online'
    },
    { 
      id: 'JaneDoe', 
      name: 'Jane Doe', 
      message: 'Can you send me the files?', 
      time: '5h', 
      isGroup: false
    },
    { 
      id: 'Design Team', 
      name: 'Design Team', 
      message: 'Meeting at 3pm today', 
      time: '8h', 
      isGroup: true
    }
  ];

  return (
    <div className="dark:bg-netflix-black w-80 flex flex-col h-full">
      {/* Header Section */}
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold mb-4">Messages</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 text-muted-foreground -translate-y-1/2" />
          <Input 
            placeholder="Search conversations..." 
            className="pl-9 bg-secondary/50"
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2 p-4">
        <Button variant="outline" size="sm" className="flex-1">
          <Users className="h-4 w-4 mr-2" />
          Groups
        </Button>
        <Button variant="outline" size="sm" className="flex-1">
          <MessageSquare className="h-4 w-4 mr-2" />
          Direct
        </Button>
      </div>

      {/* Chat List */}
      <ScrollArea className="flex-1 px-2">
        {chatItems.map((chat) => (
          <motion.div
            key={chat.id}
            whileHover={{ backgroundColor: 'rgba(var(--primary-rgb), 0.05)' }}
            className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer mb-1 ${
              selectedChat?.id === chat.id ? 'bg-primary/10' : ''
            }`}
            onClick={() => onChatSelect(chat.id)}
          >
            <div className="relative">
              <Avatar>
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  {chat.isGroup ? '👥' :'👤'}
                </div>
              </Avatar>
              {chat.status === 'online' && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center mb-1">
                <p className="font-medium truncate">{chat.name}</p>
                <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                  {chat.time}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground truncate">
                  {chat.message}
                </p>
                {chat.unreadCount && (
                  <span className="ml-2 bg-primary text-primary-foreground text-xs rounded-full px-2 py-0.5">
                    {chat.unreadCount}
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </ScrollArea>

      {/* New Chat Button */}
      <div className="p-4 border-t">
        <Button className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          New Chat
        </Button>
      </div>
    </div>
  );
}