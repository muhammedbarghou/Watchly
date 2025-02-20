import { useState, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { AnimatePresence, motion } from "framer-motion";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MainLayout } from '@/components/layout/MainLayout';
import { Loader2, Film, Lock, Eye, EyeOff, Users, Globe2, Info, Link2, MessageSquare, Settings2} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRoom } from '@/hooks/useRoom';
import { CreateRoomDto, ParticipantRole } from '@/types/room';

const BACKGROUND_IMAGE = "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80";

export function CreateRoomCard() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { createRoom, loading: isSubmitting } = useRoom();
  
  // Basic Room Settings
  const [name, setName] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Advanced Room Settings
  const [maxParticipants, setMaxParticipants] = useState('10');
  const [autoStart, setAutoStart] = useState(false);
  const [allowSkip, setAllowSkip] = useState(true);
  const [allowPlaybackControl, setAllowPlaybackControl] = useState(true);
  const [chatEnabled, setChatEnabled] = useState(true);
  const [autoCleanup, setAutoCleanup] = useState(true);
  
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [formTouched, setFormTouched] = useState(false);

  const roomId = useMemo(() => uuidv4(), []);

  const validateForm = () => {
    const errors: string[] = [];

    if (!name.trim()) {
      errors.push('Room name is required');
    } else if (name.length < 3) {
      errors.push('Room name must be at least 3 characters');
    }

    if (!videoUrl.trim()) {
      errors.push('Video URL is required');
    } else {
      try {
        new URL(videoUrl);
      } catch {
        errors.push('Please enter a valid video URL');
      }
    }

    if (!isPublic && (!password || password.length < 4)) {
      errors.push('Private rooms require a password of at least 4 characters');
    }

    if (!currentUser) {
      errors.push('You must be logged in to create a room');
    }

    if (errors.length > 0) {
      errors.forEach(error => toast.error(error));
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || !currentUser?.customUID) return;

    try {
      const roomData: CreateRoomDto = {
        key: roomId,
        name: name.trim(),
        videoUrl: videoUrl.trim(),
        createdBy: currentUser.customUID,
        isPublic,
        password: !isPublic ? password : undefined,
        maxParticipants: parseInt(maxParticipants),
        autoStart,
        participants: [{
          userId: currentUser.customUID,
          name: currentUser.displayName || 'Anonymous',
          role: 'admin' as ParticipantRole,
          joinedAt: new Date(),
          lastActive: new Date()
        }],
        videoState: {
          currentTime: 0,
          isPlaying: false,
          playbackRate: 1,
          lastUpdated: new Date()
        },
        settings: {
          isPrivate: !isPublic,
          allowSkip,
          allowPlaybackControl,
          maxParticipants: parseInt(maxParticipants),
          chatEnabled,
          autoCleanup
        }
      };

      const newRoom = await createRoom(roomData);
      toast.success('Room created successfully!');
      navigate(`/room/${newRoom.key}`);
    } catch (error) {
      toast.error('Failed to create room. Please try again.');
    }
  };

  const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <MainLayout>
      <TooltipProvider>
        <main 
          className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5"
          style={{
            backgroundImage: `linear-gradient(to bottom right, rgba(0,0,0,0.8), rgba(0,0,0,0.9)), url(${BACKGROUND_IMAGE})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className="container mx-auto px-4 py-12">
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={formVariants}
              className="max-w-3xl mx-auto"
            >
              <motion.header className="text-center mb-8" variants={itemVariants}>
                <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60 mb-3">
                  Create Your Theater Room
                </h1>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                  Set up a synchronized viewing experience and invite friends to watch together in real-time
                </p>
              </motion.header>

              <motion.form 
                onSubmit={handleSubmit}
                onChange={() => !formTouched && setFormTouched(true)}
                className="space-y-8 backdrop-blur-xl bg-black/40 rounded-xl p-8 shadow-2xl border border-primary/10"
                variants={formVariants}
              >
                {/* Basic Settings */}
                <div className="space-y-6">
                  <motion.div variants={itemVariants}>
                    <Label htmlFor="room-name" className="text-base">Room Name</Label>
                    <div className="relative mt-2">
                      <Film className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="room-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter a memorable name for your room"
                        className="pl-11 h-12"
                        required
                      />
                    </div>
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <Label htmlFor="video-url" className="text-base">Video URL</Label>
                    <div className="relative mt-2">
                      <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="video-url"
                        type="url"
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        placeholder="Paste the video URL you want to watch"
                        className="pl-11 h-12"
                        required
                      />
                    </div>
                  </motion.div>

                  <Separator className="bg-primary/10" />

                  <motion.div variants={itemVariants} className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="public-toggle" className="text-base">Public Room</Label>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="w-4 h-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            Public rooms are accessible to anyone with the link
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {isPublic ? "Anyone can join with the link" : "Password protected access"}
                      </p>
                    </div>
                    <Switch
                      id="public-toggle"
                      checked={isPublic}
                      onCheckedChange={setIsPublic}
                    />
                  </motion.div>

                  {!isPublic && (
                    <motion.div variants={itemVariants}>
                      <Label htmlFor="password" className="text-base">Room Password</Label>
                      <div className="relative mt-2">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Set a password for your private room"
                          className="pl-11 pr-11 h-12"
                          required={!isPublic}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-1/2 -translate-y-1/2"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </motion.div>
                  )}

                  <motion.div variants={itemVariants}>
                    <Button
                      type="button"
                      variant="default"
                      className="w-full"
                      onClick={() => setShowAdvanced(!showAdvanced)}
                    >
                      <Settings2 className="w-4 h-4 mr-2" />
                      {showAdvanced ? "Hide" : "Show"} Advanced Settings
                    </Button>
                  </motion.div>

                  {showAdvanced && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-6"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <motion.div variants={itemVariants}>
                          <Label htmlFor="max-participants" className="text-base">Max Participants</Label>
                          <div className="relative mt-2">
                            <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <Select value={maxParticipants} onValueChange={setMaxParticipants}>
                              <SelectTrigger className="pl-11 h-12">
                                <SelectValue placeholder="Select maximum participants" />
                              </SelectTrigger>
                              <SelectContent>
                                {[5, 10, 15, 20, 25, 30].map(num => (
                                  <SelectItem key={num} value={num.toString()}>
                                    {num} participants
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </motion.div>

                        <motion.div variants={itemVariants} className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label className="text-base">Auto-start Video</Label>
                              <p className="text-sm text-muted-foreground">Start playing when users join</p>
                            </div>
                            <Switch checked={autoStart} onCheckedChange={setAutoStart} />
                          </div>
                        </motion.div>

                        <motion.div variants={itemVariants} className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <Label className="text-base">Allow Skipping</Label>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <Info className="w-4 h-4 text-muted-foreground" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    Let users skip to any part of the video
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                              <p className="text-sm text-muted-foreground">Video seeking controls</p>
                            </div>
                            <Switch checked={allowSkip} onCheckedChange={setAllowSkip} />
                          </div>
                        </motion.div>

                        <motion.div variants={itemVariants} className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <Label className="text-base">Playback Control</Label>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <Info className="w-4 h-4 text-muted-foreground" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    Allow users to control playback speed
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                              <p className="text-sm text-muted-foreground">Speed adjustment</p>
                            </div>
                            <Switch checked={allowPlaybackControl} onCheckedChange={setAllowPlaybackControl} />
                          </div>
                        </motion.div>

                        <motion.div variants={itemVariants} className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <Label className="text-base">Enable Chat</Label>
                                <MessageSquare className="w-4 h-4 text-muted-foreground" />
                              </div>
                              <p className="text-sm text-muted-foreground">Real-time chat feature</p>
                            </div>
                            <Switch checked={chatEnabled} onCheckedChange={setChatEnabled} />
                          </div>
                        </motion.div>

                        <motion.div variants={itemVariants} className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <Label className="text-base">Auto Cleanup</Label>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <Info className="w-4 h-4 text-muted-foreground" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    Automatically close room when inactive
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                              <p className="text-sm text-muted-foreground">Close inactive rooms</p>
                            </div>
                            <Switch checked={autoCleanup} onCheckedChange={setAutoCleanup} />
                          </div>
                        </motion.div>
                      </div>
                    </motion.div>
                  )}
                </div>

                <motion.div variants={itemVariants}>
                  <Button 
                    type="submit" 
                    size="lg"
                    className="w-full h-12 text-base"
                    disabled={isSubmitting || !currentUser}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Creating Your Theater...
                      </>
                    ) : (
                      <>
                        <Globe2 className="w-5 h-5 mr-2" />
                        Create Theater Room
                      </>
                    )}
                  </Button>
                  {!currentUser && (
                    <p className="text-sm text-muted-foreground mt-3 text-center">
                      Please login to create a room
                    </p>
                  )}
                </motion.div>
              </motion.form>
            </motion.div>
          </div>
        </main>
      </TooltipProvider>
  </MainLayout>
  );
}

export default CreateRoomCard;