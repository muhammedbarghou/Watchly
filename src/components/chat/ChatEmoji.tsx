import React from 'react';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { Smile } from 'lucide-react';
import { Button } from '../ui/button';

interface ChatEmojiProps {
  onEmojiSelect: (emoji: string) => void;
}

export function ChatEmoji({ onEmojiSelect }: ChatEmojiProps) {
  const [showPicker, setShowPicker] = React.useState(false);

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setShowPicker(!showPicker)}
        aria-label="Open emoji picker"
      >
        <Smile className="w-5 h-5" />
      </Button>

      {showPicker && (
        <div className="absolute bottom-full right-0 mb-2">
          <Picker
            data={data}
            onEmojiSelect={(emoji: any) => {
              onEmojiSelect(emoji.native);
              setShowPicker(false);
            }}
            theme="dark"
          />
        </div>
      )}
    </div>
  );
}