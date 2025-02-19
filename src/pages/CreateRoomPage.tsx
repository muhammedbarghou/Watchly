import { useState, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MainLayout } from '@/components/layout/MainLayout';
import { 
  Loader2, Film, Lock, Eye, EyeOff, 
  Users, Globe2, Info, Link2
} from 'lucide-react';
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

export function CreateRoomCard() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [name, setName] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formTouched, setFormTouched] = useState(false);
  const [isPublic, setIsPublic] = useState(true);
  const [maxParticipants, setMaxParticipants] = useState('10');
  const [autoStart, setAutoStart] = useState(false);

  const roomId = useMemo(() => uuidv4(), []);

  const validateForm = () => {
    const errors: string[] = [];

    if (!name.trim()) {
      errors.push('Please enter a room name');
    } else if (name.length < 3) {
      errors.push('Room name must be at least 3 characters long');
    }

    if (!videoUrl.trim()) {
      errors.push('Please enter a video URL');
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
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      // Simulated API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Room created successfully!');
      navigate(`/room/${roomId}`);
    } catch (error) {
      toast.error('Failed to create room. Please try again.');
    } finally {
      setIsSubmitting(false);
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
        <main className="min-h-screen bg-gradient-to-b from-background to-muted/20">
          <div className="container mx-auto px-4 py-8">
            <motion.section 
              initial="hidden"
              animate="visible"
              variants={formVariants}
              className="max-w-3xl mx-auto"
            >
              <motion.header className="text-center mb-8" variants={itemVariants}>
                <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
                  Create Your Theater Room
                </h1>
                <p className="text-muted-foreground mt-2 max-w-xl mx-auto">
                  Set up a synchronized viewing experience and invite friends to watch together
                </p>
              </motion.header>

              <motion.form 
                onSubmit={handleSubmit}
                className="space-y-8 bg-card rounded-xl p-8 shadow-lg border"
                variants={formVariants}
                onChange={() => !formTouched && setFormTouched(true)}
              >
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

                  <Separator />

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
                        {isPublic ? "Anyone can join" : "Password protected"}
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

                    <motion.div variants={itemVariants} className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="auto-start" className="text-base">Auto-start Video</Label>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="w-4 h-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              Video will start automatically when participants join
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {autoStart ? "Starts automatically" : "Manual start"}
                        </p>
                      </div>
                      <Switch
                        id="auto-start"
                        checked={autoStart}
                        onCheckedChange={setAutoStart}
                      />
                    </motion.div>
                  </div>
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
            </motion.section>
          </div>
        </main>
      </TooltipProvider>
    </MainLayout>
  );
}

export default CreateRoomCard;

