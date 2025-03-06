import { useState, useRef, useEffect } from 'react';
import { Send, Info, ArrowRight } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  currentUserId: string;
}

export default function SimpleChatSection({
  chat,
  messages,
  onSendMessage,
  currentUserId
}: SimpleChatSectionProps) {
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
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
        
        <div className="flex-1">
          <h3 className="font-semibold">{chat.name}</h3>
          <p className="text-xs text-muted-foreground">
            {chat.participants.length > 2 
              ? `${chat.participants.length} participants` 
              : 'Active now'}
          </p>
        </div>
        
        <Button variant="ghost" size="icon" className="ml-auto">
          <Info className="h-5 w-5" />
        </Button>
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
                      weekday: 'long',
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
                      <div className="flex max-w-[70%]">
                        {!isCurrentUser && (
                          <Avatar className="h-8 w-8 mr-2 mt-1">
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
                          
                          <div className={`rounded-2xl px-4 py-2 ${
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
          <Button type="submit" size="icon" disabled={!messageText.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}