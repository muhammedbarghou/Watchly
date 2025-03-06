import { useState } from 'react';
import { Search, Plus, MessageSquare } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface ChatRoom {
  id: string;
  name: string;
  participants: {
    id: string;
    name: string;
    photo?: string;
  }[];
  lastMessage?: {
    text: string;
    timestamp: any;
  };
}

// Matching your existing Friend interface structure
interface Friend {
  uid: string;
  name: string;
  photoURL: string | null;
  status: 'online' | 'offline';
  lastSeen?: string;
}

interface SimpleChatSidebarProps {
  chats: ChatRoom[];
  selectedChat: ChatRoom | null;
  onSelectChat: (chat: ChatRoom) => void;
  friends: Friend[];
  onCreateChat: (participants: string[]) => void;
  currentUserId: string;
}

export default function SimpleChatSidebar({
  chats,
  selectedChat,
  onSelectChat,
  friends,
  onCreateChat,
  currentUserId
}: SimpleChatSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);

  // Filter chats based on search query
  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Format timestamp for display
  const formatTime = (timestamp: any) => {
    if (!timestamp) return '';
    
    const date = timestamp.toDate();
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const dayDiff = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (dayDiff === 0) {
      // Today, return time
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (dayDiff < 7) {
      // Less than a week, return day name
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      // More than a week, return date
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  // Toggle friend selection in the new chat dialog
  const toggleFriendSelection = (friendId: string) => {
    setSelectedFriends(prev => {
      if (prev.includes(friendId)) {
        return prev.filter(id => id !== friendId);
      } else {
        return [...prev, friendId];
      }
    });
  };

  // Handle creating a new chat
  const handleCreateChat = () => {
    if (selectedFriends.length === 0) return;
    
    onCreateChat(selectedFriends);
    setSelectedFriends([]);
    setDialogOpen(false);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Messages</h2>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="icon" variant="ghost" className="rounded-full">
                <Plus className="h-5 w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New Message</DialogTitle>
              </DialogHeader>
              
              <div className="mt-4">
                <p className="text-sm text-muted-foreground mb-2">
                  Select friends to message
                </p>
                
                <ScrollArea className="h-64 pr-4">
                  {friends.length === 0 ? (
                    <p className="text-center text-muted-foreground p-4">
                      No friends found. Add friends to start a conversation.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {friends.map(friend => (
                        <div 
                          key={friend.uid} 
                          className="flex items-center p-2 rounded-lg hover:bg-muted/50"
                        >
                          <Checkbox 
                            id={`friend-${friend.uid}`}
                            checked={selectedFriends.includes(friend.uid)}
                            onCheckedChange={() => toggleFriendSelection(friend.uid)}
                            className="mr-3"
                          />
                          <Avatar className="h-9 w-9 mr-3">
                            {friend.photoURL ? (
                              <AvatarImage src={friend.photoURL} alt={friend.name} />
                            ) : (
                              <AvatarFallback>
                                {friend.name.charAt(0)}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <Label 
                            htmlFor={`friend-${friend.uid}`}
                            className="flex-1 cursor-pointer"
                          >
                            <div className="flex flex-col">
                              <span>{friend.name}</span>
                              <span className="text-xs text-muted-foreground">
                                {friend.status === 'online' ? 
                                  <span className="text-green-500">● Online</span> : 
                                  `Last seen: ${friend.lastSeen || 'recently'}`
                                }
                              </span>
                            </div>
                          </Label>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>
              
              <DialogFooter className="mt-4">
                <Button 
                  onClick={handleCreateChat} 
                  disabled={selectedFriends.length === 0}
                >
                  Start Chat
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search messages..."
            className="pl-9"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      {/* Chat List */}
      <ScrollArea className="flex-1">
        {filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 h-40">
            <MessageSquare className="h-10 w-10 text-muted-foreground mb-4" />
            <p className="text-center text-muted-foreground">
              {searchQuery ? 
                `No conversations matching "${searchQuery}"` : 
                "No conversations yet. Start chatting!"}
            </p>
          </div>
        ) : (
          <div className="p-2">
            {filteredChats.map(chat => {
              // Find the other participant for 1:1 chats to get their photo
              const otherParticipant = chat.participants.find(p => p.id !== currentUserId);
              
              return (
                <div
                  key={chat.id}
                  className={`flex items-center p-3 rounded-lg cursor-pointer mb-1
                    ${selectedChat?.id === chat.id ? 'bg-muted' : 'hover:bg-muted/50'}`}
                  onClick={() => onSelectChat(chat)}
                >
                  <Avatar className="h-12 w-12 mr-3">
                    {chat.participants.length > 2 ? (
                      <AvatarFallback className="bg-primary/10">
                        👥
                      </AvatarFallback>
                    ) : otherParticipant?.photo ? (
                      <AvatarImage src={otherParticipant.photo} alt={chat.name} />
                    ) : (
                      <AvatarFallback>
                        {chat.name.charAt(0)}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between">
                      <h3 className="font-medium truncate">{chat.name}</h3>
                      {chat.lastMessage?.timestamp && (
                        <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                          {formatTime(chat.lastMessage.timestamp)}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-sm text-muted-foreground truncate">
                      {chat.lastMessage?.text || "No messages yet"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}