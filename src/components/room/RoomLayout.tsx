import React, { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

interface RoomLayoutProps {
  roomId?: string;
  roomName?: string;
  children: ReactNode;
  onLeaveRoom?: () => Promise<void>;
}

const RoomLayout: React.FC<RoomLayoutProps> = ({ 
  roomId,
  roomName,
  children,
  onLeaveRoom
}) => {
  const navigate = useNavigate();

  const handleLeaveRoom = async () => {
    try {
      if (onLeaveRoom) {
        await onLeaveRoom();
      }
      navigate('/hub');
      toast.success('You have left the room');
    } catch (error) {
      console.error('Error leaving room:', error);
      toast.error('Failed to leave the room');
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      {/* Navigation Bar */}
      <header className="border-b border-border px-4 h-16 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/')}
            className="mr-2"
          >
            <Home className="h-5 w-5" />
          </Button>
          <h1 className="font-bold text-xl">WatchRoom</h1>
          {roomName && (
            <>
              <Separator orientation="vertical" className="h-6 mx-2" />
              <span className="font-medium text-base">{roomName}</span>
              {roomId && (
                <span className="text-sm text-muted-foreground ml-2">({roomId})</span>
              )}
            </>
          )}
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleLeaveRoom}
          className="flex items-center gap-1"
        >
          <LogOut className="h-4 w-4" />
          Leave Room
        </Button>
      </header>

      {/* Main Layout */}
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  );
};

export default RoomLayout;