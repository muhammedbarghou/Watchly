import React, { useRef, useEffect } from 'react';
import { Timestamp } from 'firebase/firestore';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

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

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  activeUsers: User[];
  isLoading?: boolean;
  className?: string;
}

const MessageList: React.FC<MessageListProps> = ({
  messages,
  currentUserId,
  activeUsers,
  isLoading = false,
  className = ''
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Format timestamp
  const formatTimestamp = (timestamp: Timestamp | null): string => {
    if (!timestamp) return '';
    
    const date = timestamp.toDate();
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Check if message is from current user
  const isCurrentUserMessage = (senderId: string): boolean => {
    return currentUserId === senderId;
  };

  // Get user by ID from active users
  const getUser = (userId: string): User | undefined => {
    return activeUsers.find(user => user.id === userId);
  };

  // Group consecutive messages from the same sender
  const groupedMessages = messages.reduce<Array<Message[]>>((groups, message) => {
    if (message.sender === 'system') {
      // System messages are always in their own group
      groups.push([message]);
      return groups;
    }

    const lastGroup = groups[groups.length - 1];
    
    // Start a new group if:
    // 1. There are no groups yet
    // 2. Last group was a system message
    // 3. Last message in the group was from a different sender
    // 4. Last message was more than 2 minutes ago
    if (
      !lastGroup || 
      lastGroup[0].sender === 'system' || 
      lastGroup[0].sender !== message.sender ||
      (lastGroup[lastGroup.length - 1].timestamp && 
       message.timestamp && 
       message.timestamp.toMillis() - (lastGroup[lastGroup.length - 1].timestamp?.toMillis() || 0) > 120000)
    ) {
      groups.push([message]);
    } else {
      lastGroup.push(message);
    }
    
    return groups;
  }, []);

  return (
    <ScrollArea className={`h-full ${className}`}>
      <div className="p-4 space-y-4">
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
          <>
            {groupedMessages.map((group, groupIndex) => {
              // System messages
              if (group[0].sender === 'system') {
                return (
                  <div key={`group-${groupIndex}`} className="w-full">
                    <div className="bg-muted/40 text-center rounded-md py-1 px-2 my-2">
                      <p className="text-xs text-muted-foreground">
                        {group[0].text}
                      </p>
                      {group[0].timestamp && (
                        <span className="text-xs text-muted-foreground">
                          {formatTimestamp(group[0].timestamp)}
                        </span>
                      )}
                    </div>
                  </div>
                );
              }

              const isSelfMessage = isCurrentUserMessage(group[0].sender);
              const user = getUser(group[0].sender);
              
              return (
                <div 
                  key={`group-${groupIndex}`} 
                  className={`flex ${isSelfMessage ? 'justify-end' : 'justify-start'}`}
                >
                  {!isSelfMessage && (
                    <Avatar className="h-8 w-8 mt-1 flex-shrink-0 mr-2">
                      {group[0].senderPhotoURL ? (
                        <AvatarImage src={group[0].senderPhotoURL} alt={group[0].senderDisplayName} />
                      ) : (
                        <AvatarFallback>
                          {group[0].senderDisplayName?.charAt(0) || 'U'}
                        </AvatarFallback>
                      )}
                    </Avatar>
                  )}

                  <div className={`flex flex-col ${isSelfMessage ? 'items-end' : 'items-start'} max-w-[75%]`}>
                    {/* Header with name, host badge, timestamp */}
                    <div className="flex items-center gap-2 mb-1">
                      {!isSelfMessage && (
                        <>
                          <span className="text-xs font-medium">
                            {group[0].senderDisplayName}
                          </span>
                          {user?.isHost && (
                            <Badge variant="outline" className="text-xs py-0 h-4">Host</Badge>
                          )}
                        </>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {formatTimestamp(group[0].timestamp)}
                      </span>
                    </div>

                    {/* Messages */}
                    <div className="space-y-1">
                      {group.map(message => (
                        <div 
                          key={message.id} 
                          className={`${
                            isSelfMessage 
                              ? 'bg-primary/10 text-primary-foreground' 
                              : 'bg-secondary text-secondary-foreground'
                          } p-2 rounded-lg ${
                            isSelfMessage ? 'rounded-tr-none' : 'rounded-tl-none'
                          }`}
                        >
                          <p className="text-sm break-words">{message.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>
    </ScrollArea>
  );
};

export default MessageList;