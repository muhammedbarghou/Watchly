import React, { useState, useRef, useEffect } from 'react';
import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  query, 
  onSnapshot, 
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Send, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface Message {
  id: string;
  text: string;
  sender: string;
  senderDisplayName: string;
  senderPhotoURL?: string;
  timestamp: Timestamp | null;
}

interface User {
  id: string;
  displayName: string;
  photoURL?: string;
  isHost: boolean;
}

interface ChatPanelProps {
  documentId: string;
  currentUser: {
    uid: string;
    displayName: string | null;
    photoURL: string | null;
  } | null;
  activeUsers: User[];
  onClose?: () => void;
  isCollapsible?: boolean;
}

const ChatPanel: React.FC<ChatPanelProps> = ({
  documentId,
  currentUser,
  activeUsers,
  onClose,
  isCollapsible = false
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Setup messages listener
  useEffect(() => {
    if (!documentId) return;

    setIsLoading(true);
    
    // Subscribe to messages
    const messagesRef = collection(db, 'rooms', documentId, 'messages');
    const messagesQuery = query(messagesRef);
    
    const unsubscribeMessages = onSnapshot(messagesQuery, (snapshot) => {
      const messagesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Message[];
      
      // Sort messages by timestamp
      const sortedMessages = messagesData.sort((a, b) => {
        if (!a.timestamp) return -1;
        if (!b.timestamp) return 1;
        return a.timestamp.toMillis() - b.timestamp.toMillis();
      });
      
      setMessages(sortedMessages);
      scrollToBottom();
      setIsLoading(false);
    }, (error) => {
      console.error('Error loading messages:', error);
      toast.error('Failed to load chat messages');
      setIsLoading(false);
    });

    return () => {
      unsubscribeMessages();
    };
  }, [documentId]);

  // Send a chat message
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !currentUser || !documentId) return;
    
    try {
      await addDoc(collection(db, 'rooms', documentId, 'messages'), {
        text: newMessage.trim(),
        sender: currentUser.uid,
        senderDisplayName: currentUser.displayName || 'Anonymous',
        senderPhotoURL: currentUser.photoURL,
        timestamp: serverTimestamp(),
      });
      
      setNewMessage('');
      
      // Focus input again after sending
      if (inputRef.current) {
        inputRef.current.focus();
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp: Timestamp | null): string => {
    if (!timestamp) return '';
    
    const date = timestamp.toDate();
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Check if message is from current user
  const isCurrentUserMessage = (senderId: string): boolean => {
    return currentUser?.uid === senderId;
  };

  return (
    <Card className="h-full flex flex-col border-2 border-primary/10">
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Chat</CardTitle>
            <CardDescription>
              {activeUsers.length} {activeUsers.length === 1 ? 'person' : 'people'} in the room
            </CardDescription>
          </div>
          {isCollapsible && onClose && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <Separator className="mt-2" />
      </CardHeader>
      <CardContent className="p-0 flex-1 flex flex-col overflow-hidden">
        {/* Messages area */}
        <ScrollArea className="flex-1 px-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-20">
              <p className="text-sm text-muted-foreground">Loading messages...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-40">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">No messages yet</p>
                <p className="text-xs text-muted-foreground mt-1">Be the first to say something!</p>
              </div>
            </div>
          ) : (
            <div className="py-4 space-y-4">
              {messages.map((message) => (
                <div 
                  key={message.id} 
                  className={`flex items-start gap-2 ${
                    isCurrentUserMessage(message.sender) ? 'justify-end' : ''
                  }`}
                >
                  {message.sender !== 'system' ? (
                    isCurrentUserMessage(message.sender) ? (
                      // Current user message - Updated styling with better colors
                      <div className="flex flex-col items-end">
                        <div className="bg-primary text-primary-foreground p-2 rounded-lg rounded-tr-none max-w-[80%]">
                          <p className="text-sm">{message.text}</p>
                        </div>
                        <span className="text-xs text-muted-foreground mt-1">
                          {formatTimestamp(message.timestamp)}
                        </span>
                      </div>
                    ) : (
                      // Other user message
                      <div className="flex gap-2">
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          {message.senderPhotoURL && (
                            <AvatarImage src={message.senderPhotoURL} alt={message.senderDisplayName} />
                          )}
                          <AvatarFallback>
                            {message.senderDisplayName?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium">
                              {message.senderDisplayName}
                            </span>
                            {activeUsers.find(user => user.id === message.sender)?.isHost && (
                              <Badge variant="outline" className="text-xs py-0 h-4">Host</Badge>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {formatTimestamp(message.timestamp)}
                            </span>
                          </div>
                          <div className="bg-secondary p-2 rounded-lg rounded-tl-none max-w-[80%]">
                            <p className="text-sm">{message.text}</p>
                          </div>
                        </div>
                      </div>
                    )
                  ) : (
                    // System message - Updated styling
                    <div className="w-full flex justify-center">
                      <div className="bg-muted px-3 py-1 rounded-full my-1 inline-flex items-center gap-2">
                        <p className="text-xs text-muted-foreground">
                          {message.text}
                        </p>
                        {message.timestamp && (
                          <span className="text-xs text-muted-foreground/70">
                            {formatTimestamp(message.timestamp)}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>
        
        {/* Input area */}
        <form onSubmit={sendMessage} className="p-4 border-t flex-shrink-0">
          <div className="flex items-center gap-2">
            <Input
              ref={inputRef}
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              disabled={!currentUser}
              className="flex-1"
            />
            <Button type="submit" size="icon" disabled={!newMessage.trim() || !currentUser}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
          {!currentUser && (
            <p className="text-xs text-muted-foreground mt-2">
              You need to be logged in to send messages
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
};

export default ChatPanel;