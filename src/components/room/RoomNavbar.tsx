import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Users, Copy, PhoneCall, ListVideo, UserPlus } from 'lucide-react';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

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
  isHost?: boolean;
  onSetNextVideo?: (videoUrl: string, playImmediately: boolean) => Promise<void>;
  onToggleInvite?: () => void; // Added this prop
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
  voiceChatPanelOpen,
  isHost = false,
  onSetNextVideo,
  onToggleInvite
}) => {
  const navigate = useNavigate();
  const [videoDialogOpen, setVideoDialogOpen] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [playOption, setPlayOption] = useState('queue');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSubmitVideo = async () => {
    if (!videoUrl.trim()) {
      toast.error('Please enter a valid video URL');
      return;
    }

    if (!onSetNextVideo) {
      toast.error('Video queue functionality not available');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSetNextVideo(videoUrl, playOption === 'immediate');
      setVideoDialogOpen(false);
      setVideoUrl('');
      toast.success(playOption === 'queue' 
        ? 'Video added to queue' 
        : 'Video will play now');
    } catch (error) {
      console.error('Error setting next video:', error);
      toast.error('Failed to set video');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <header className="border-b border-border px-4 h-16 flex items-center justify-between shrink-0 bg-background z-10">
        <div className="flex items-center gap-2">        
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
          
          {/* Invite Friends Button */}
          {onToggleInvite && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={onToggleInvite}
                  >
                    <UserPlus className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Invite Friends</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          
          {/* Video Queue Button - Only visible to host */}
          {isHost && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setVideoDialogOpen(true)}
                  >
                    <ListVideo className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Set Next Video</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          
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

      {/* Video Queue Dialog */}
      <Dialog open={videoDialogOpen} onOpenChange={setVideoDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Set Next Video</DialogTitle>
            <DialogDescription>
              Enter a video URL to queue or play immediately.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="video-url">Video URL</Label>
              <Input
                id="video-url"
                placeholder="https://www.youtube.com/watch?v=..."
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Play Options</Label>
              <RadioGroup value={playOption} onValueChange={setPlayOption}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="queue" id="queue" />
                  <Label htmlFor="queue">Add to Queue</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="immediate" id="immediate" />
                  <Label htmlFor="immediate">Play Immediately</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setVideoDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitVideo} disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RoomNavbar;