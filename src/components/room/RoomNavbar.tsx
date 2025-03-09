import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Home, Users, Copy, PhoneCall } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ThemeToggle } from "../ui/theme-toggle"
import logo from "../../assets/logo.png"
import logo2 from "../../assets/Logo2.png"
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface RoomNavbarProps {
  roomId?: string;
  roomName?: string;
  hostName?: string;
  activeUsersCount: number;
  voiceChatEnabled?: boolean;
  voiceChatActiveUsers?: number;
  onLeaveRoom?: () => Promise<void>;
  onToggleParticipants?: () => void;
  participantsPanelOpen?: boolean;
  onToggleVoiceChat?: () => void;
  voiceChatPanelOpen?: boolean;
}

const RoomNavbar: React.FC<RoomNavbarProps> = ({ 
  roomId,
  roomName,
  hostName,
  activeUsersCount,
  voiceChatEnabled = false,
  voiceChatActiveUsers = 0,
  onLeaveRoom,
  onToggleParticipants,
  participantsPanelOpen,
  onToggleVoiceChat,
  voiceChatPanelOpen
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

  const copyRoomId = () => {
    if (roomId) {
      navigator.clipboard.writeText(roomId);
      toast.success('Room ID copied to clipboard');
    }
  };

  return (
    <header className="border-b border-border px-4 h-16 flex items-center justify-between shrink-0 bg-background z-10">
      <div className="flex items-center gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => navigate('/')}
                className="mr-1"
              >
                <Home className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Go Home</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <img src={logo || "/placeholder.svg"} alt="Logo" className="h-6 sm:h-7 hidden dark:block" />
        <img src={logo2 || "/placeholder.svg"} alt="Logo" className="h-6 sm:h-7 dark:hidden" />
        
        {roomName && (
          <>
            <Separator orientation="vertical" className="h-6 mx-2 hidden sm:block" />
            <span className="font-medium text-base truncate max-w-[150px] sm:max-w-[250px]">
              {roomName}
            </span>
          </>
        )}
        
        {hostName && (
          <span className="text-sm text-muted-foreground hidden md:inline-block ml-2">
            Host: {hostName}
          </span>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        <ThemeToggle />
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={copyRoomId}
                disabled={!roomId}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Copy Room ID</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        {/* Voice Chat Button */}
        {voiceChatEnabled && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant={voiceChatPanelOpen ? "secondary" : "ghost"}
                  size="icon" 
                  onClick={onToggleVoiceChat}
                  className="relative"
                >
                  <PhoneCall className="h-4 w-4" />
                  {voiceChatActiveUsers > 0 && (
                    <Badge 
                      className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0"
                      variant="secondary"
                    >
                      {voiceChatActiveUsers}
                    </Badge>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Toggle Voice Chat Panel</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant={participantsPanelOpen ? "secondary" : "ghost"}
                size="icon" 
                onClick={onToggleParticipants}
                className="relative"
              >
                <Users className="h-4 w-4" />
                <Badge 
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0"
                  variant="secondary"
                >
                  {activeUsersCount}
                </Badge>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Toggle Participants Panel</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLeaveRoom}
                className="flex items-center gap-1 ml-2"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Leave Room</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Leave this room</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </header>
  );
};

export default RoomNavbar;