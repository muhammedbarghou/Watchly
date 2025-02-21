import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MainLayout } from '@/components/layout/MainLayout';
import { 
  Loader2, Key, Lock, Eye, EyeOff, 
  LogIn, Info
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useRoom } from '@/hooks/useRoom';

// UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function JoinRoomPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [roomKey, setRoomKey] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { joinRoom, loading: joiningRoom } = useRoom(roomKey || undefined);

  const validateForm = () => {
    const errors: string[] = [];

    if (!currentUser) {
      errors.push('You must be logged in to join a room');
      errors.forEach(error => toast.error(error));
      return false;
    }

    if (!roomKey.trim()) {
      errors.push('Please enter a room key');
    } else if (!UUID_REGEX.test(roomKey.trim())) {
      errors.push('Invalid room key format');
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
      await joinRoom(password || undefined);
      toast.success('Successfully joined the room!');
      navigate(`/room/${roomKey}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to join room';
      toast.error(errorMessage);
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

  const isDisabled = isSubmitting || joiningRoom || !currentUser;

  return (
    <MainLayout>
      <TooltipProvider>
        <main className="">
          <div className="container mx-auto px-4 py-8">
            <motion.section 
              initial="hidden"
              animate="visible"
              variants={formVariants}
              className="max-w-3xl mx-auto"
            >
              <motion.header className="text-center mb-8" variants={itemVariants}>
                <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
                  Join a Theater Room
                </h1>
                <p className="text-muted-foreground mt-2 max-w-xl mx-auto">
                  Enter the room key to join a synchronized viewing experience
                </p>
              </motion.header>

              <motion.form 
                onSubmit={handleSubmit}
                className="space-y-8 bg-card rounded-xl p-8 shadow-lg border"
                variants={formVariants}
              >
                <div className="space-y-6">
                  <motion.div variants={itemVariants}>
                    <div className="flex items-center gap-2 mb-2">
                      <Label htmlFor="room-key" className="text-base">Room Key</Label>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="w-4 h-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          Get the room key from the room creator
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <div className="relative mt-2">
                      <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="room-key"
                        value={roomKey}
                        onChange={(e) => setRoomKey(e.target.value)}
                        placeholder="Enter the 36-character room key"
                        className="pl-11 h-12"
                        required
                        pattern={UUID_REGEX.source}
                      />
                    </div>
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <Label htmlFor="password" className="text-base">Room Password</Label>
                    <div className="relative mt-2">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter room password (if required)"
                        className="pl-11 pr-11 h-12"
                        aria-describedby="password-optional"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 -translate-y-1/2"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                    <p id="password-optional" className="text-sm text-muted-foreground mt-2">
                      Only required for private rooms
                    </p>
                  </motion.div>
                </div>

                <motion.div variants={itemVariants}>
                  <Button 
                    type="submit" 
                    size="lg"
                    className="w-full h-12 text-base"
                    disabled={isDisabled}
                    aria-disabled={isDisabled}
                  >
                    {(isSubmitting || joiningRoom) ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Joining Room...
                      </>
                    ) : (
                      <>
                        <LogIn className="w-5 h-5 mr-2" />
                        Join Theater Room
                      </>
                    )}
                  </Button>
                  {!currentUser && (
                    <p className="text-sm text-muted-foreground mt-3 text-center">
                      Please login to join a room
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

export default JoinRoomPage;