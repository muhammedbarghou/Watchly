import { useState, useRef, useEffect } from 'react';
import { Send,  ArrowRight, Trash2, MoreVertical } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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

interface ChatMessage {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  senderPhoto?: string;
  timestamp: any;
}

interface SimpleChatSectionProps {
  chat: ChatRoom | null;
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  onDeleteChat: (chatId: string) => void;
  currentUserId: string;
}

export default function SimpleChatSection({
  chat,
  messages,
  onSendMessage,
  onDeleteChat,
  currentUserId
}: SimpleChatSectionProps) {
  const [messageText, setMessageText] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  // Check for mobile view on mount and window resize
  useEffect(() => {
    const checkMobileView = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    
    // Initial check
    checkMobileView();
    
    // Add resize listener
    window.addEventListener('resize', checkMobileView);
    
    // Clean up
    return () => window.removeEventListener('resize', checkMobileView);
  }, []);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Handle sending a message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!messageText.trim()) return;
    
    onSendMessage(messageText);
    setMessageText('');
  };
  
  // Handle chat deletion
  const handleDeleteChat = () => {
    if (chat) {
      onDeleteChat(chat.id);
      setDeleteDialogOpen(false);
    }
  };
  
  // Format timestamp for display
  const formatMessageTime = (timestamp: any) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp.toDate());
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Group messages by date
  const groupMessagesByDate = () => {
    const groups: { [key: string]: ChatMessage[] } = {};
    
    messages.forEach(message => {
      if (!message.timestamp) return;
      
      const date = message.timestamp.toDate().toLocaleDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      
      groups[date].push(message);
    });
    
    return groups;
  };
  
  const messageGroups = groupMessagesByDate();
  
  // Get other participant for UI
  const otherParticipant = chat?.participants.find(p => p.id !== currentUserId);
  
  if (!chat) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <div className="bg-primary/10 rounded-full p-4 mb-4">
          <ArrowRight className="h-10 w-10 text-primary" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Your Messages</h3>
        <p className="text-center text-muted-foreground max-w-sm">
          Select a chat or start a new conversation with your friends
        </p>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      <div className="border-b p-4 flex items-center">
        <Avatar className="h-10 w-10 mr-3">
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
          <h3 className="font-semibold truncate">{chat.name}</h3>
          <p className="text-xs text-muted-foreground truncate">
            {chat.participants.length > 2 
              ? `${chat.participants.length} participants` 
              : 'Active now'}
          </p>
        </div>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="ml-auto">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-0" align={isMobileView ? "end" : "center"}>
            <Button 
              variant="ghost" 
              className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
              onClick={() => setDeleteDialogOpen(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete conversation
            </Button>
          </PopoverContent>
        </Popover>
        
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent className={isMobileView ? "w-[90%] max-w-md" : ""}>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete conversation?</AlertDialogTitle>
              <AlertDialogDescription>
                This will remove the conversation from your chat list. If both you and {otherParticipant?.name} delete this conversation, it will be permanently removed.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className={isMobileView ? "flex-col space-y-2" : ""}>
              <AlertDialogCancel className={isMobileView ? "w-full mt-0" : ""}>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDeleteChat}
                className={`bg-red-500 hover:bg-red-600 ${isMobileView ? "w-full" : ""}`}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      
      {/* Messages */}
      <ScrollArea 
        className="flex-1 p-4" 
        ref={scrollAreaRef}
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="bg-primary/10 rounded-full p-4 mb-4">
              <Send className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-semibold mb-1">No messages yet</h3>
            <p className="text-center text-muted-foreground max-w-xs">
              Send your first message to start the conversation
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(messageGroups).map(([date, dateMessages]) => (
              <div key={date} className="space-y-4">
                <div className="flex justify-center">
                  <div className="bg-muted px-3 py-1 rounded-full text-xs text-muted-foreground">
                    {new Date(date).toLocaleDateString(undefined, {
                      weekday: isMobileView ? 'short' : 'long',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </div>
                </div>
                
                {dateMessages.map(message => {
                  const isCurrentUser = message.senderId === currentUserId;
                  const isSystemMessage = message.senderId === 'system';
                  
                  if (isSystemMessage) {
                    return (
                      <div key={message.id} className="flex justify-center">
                        <div className="bg-muted px-3 py-1 rounded-full text-xs text-muted-foreground">
                          {message.text}
                        </div>
                      </div>
                    );
                  }
                  
                  return (
                    <div 
                      key={message.id} 
                      className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex ${isMobileView ? 'max-w-[85%]' : 'max-w-[70%]'}`}>
                        {!isCurrentUser && (
                          <Avatar className={`${isMobileView ? 'h-6 w-6' : 'h-8 w-8'} mr-2 mt-1`}>
                            {message.senderPhoto ? (
                              <AvatarImage src={message.senderPhoto} alt={message.senderName} />
                            ) : (
                              <AvatarFallback>
                                {message.senderName.charAt(0)}
                              </AvatarFallback>
                            )}
                          </Avatar>
                        )}
                        
                        <div>
                          {!isCurrentUser && (
                            <p className="text-xs font-medium ml-1 mb-1">
                              {message.senderName}
                            </p>
                          )}
                          
                          <div className={`rounded-2xl px-3 py-2 ${isMobileView ? 'text-sm' : ''} ${
                            isCurrentUser 
                              ? 'bg-primary text-primary-foreground' 
                              : 'bg-muted'
                          }`}>
                            <p className="whitespace-pre-wrap break-words">{message.text}</p>
                          </div>
                          
                          <p className={`text-xs mt-1 ${isCurrentUser ? 'text-right' : ''} text-muted-foreground`}>
                            {formatMessageTime(message.timestamp)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>
      
      {/* Message input */}
      <div className="p-4 border-t">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <Input
            placeholder="Message..."
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            className="flex-1"
          />
          <Button 
            type="submit" 
            size={isMobileView ? "default" : "icon"} 
            disabled={!messageText.trim()}
          >
            {isMobileView ? (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send
              </>
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}