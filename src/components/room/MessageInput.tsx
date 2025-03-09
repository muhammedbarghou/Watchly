import React, { useState, useRef, useEffect } from 'react';
import { 
  collection, 
  addDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Send, Smile, } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface MessageInputProps {
  roomId: string;
  documentId: string;
  currentUser: {
    uid: string;
    displayName: string | null;
    photoURL: string | null;
  } | null;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  onMessageSent?: () => void;
}

const MessageInput: React.FC<MessageInputProps> = ({
  roomId,
  documentId,
  currentUser,
  disabled = false,
  placeholder = "Type a message...",
  className = "",
  onMessageSent
}) => {
  const [message, setMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on mount
  useEffect(() => {
    if (inputRef.current && !disabled) {
      inputRef.current.focus();
    }
  }, [disabled]);

  // Send a message
  const sendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!message.trim() || !currentUser || !documentId || isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      await addDoc(collection(db, 'rooms', documentId, 'messages'), {
        text: message.trim(),
        sender: currentUser.uid,
        senderDisplayName: currentUser.displayName || 'Anonymous',
        senderPhotoURL: currentUser.photoURL,
        timestamp: serverTimestamp(),
      });
      
      setMessage('');
      
      if (onMessageSent) {
        onMessageSent();
      }
      
      // Focus input again after sending
      if (inputRef.current) {
        inputRef.current.focus();
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // If Enter is pressed without Shift, send the message
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Generate disabled message
  const getDisabledMessage = (): string => {
    if (!currentUser) {
      return "You need to be logged in to send messages";
    }
    if (disabled) {
      return "Message input is disabled";
    }
    return "";
  };

  return (
    <form 
      onSubmit={sendMessage} 
      className={`flex items-center border-t p-2 ${className}`}
    >
      {/* Message input field */}
      <div className="relative flex-1">
        <Input
          ref={inputRef}
          placeholder={placeholder}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled || !currentUser}
          className="pr-12"
        />
        
        {/* Action buttons that overlay the input */}
        <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8"
                  disabled={disabled || !currentUser}
                  onClick={() => toast.info("Emoji picker not implemented")}
                >
                  <Smile className="h-4 w-4 text-muted-foreground" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Add emoji</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      
      {/* Send button */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              type="submit" 
              size="icon" 
              disabled={!message.trim() || disabled || !currentUser || isSubmitting}
              className="ml-2 h-9 w-9"
            >
              <Send className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Send message (Enter)</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      {/* Disabled message */}
      {(disabled || !currentUser) && (
        <div className="absolute bottom-full left-0 w-full bg-popover text-popover-foreground px-4 py-2 text-xs rounded-t-md border border-border">
          {getDisabledMessage()}
        </div>
      )}
    </form>
  );
};

export default MessageInput;