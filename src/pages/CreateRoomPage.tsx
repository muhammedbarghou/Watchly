import { useState, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MainLayout } from '@/components/layout/MainLayout';
import { Loader2,  Film, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import roomService from '@/api/roomService';

export function CreateRoomCard() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [name, setName] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formTouched, setFormTouched] = useState(false);

  const validateForm = () => {
    const errors: string[] = [];

    if (!name.trim()) {
      errors.push('Please enter a room name');
    } else if (name.length < 3) {
      errors.push('Room name must be at least 3 characters long');
    }

    if (!videoUrl.trim()) {
      errors.push('Please enter a video URL');
    }

    if (password && password.length < 4) {
      errors.push('Password must be at least 4 characters long');
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
    
  const roomId = useMemo(() => uuidv4(), []);



const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
      <main className="h-screen flex flex-col lg:flex-row">
        <motion.section 
          initial="hidden"
          animate="visible"
          variants={formVariants}
          className="flex-1 p-6 lg:p-12 flex flex-col justify-center"
        >
          <div className="max-w-2xl mx-auto w-full">
            <motion.header className="mb-8" variants={itemVariants}>
              <h1 className="text-3xl lg:text-4xl font-bold text-primary">
                Create Your Theater Room
              </h1>
              <p className="text-muted-foreground mt-2">
                Set up a shared viewing experience with friends
              </p>
            </motion.header>

            <motion.form 
              onSubmit={handleSubmit}
              className="space-y-6 bg-card rounded-xl p-6 shadow-lg border"
              variants={formVariants}
              onChange={() => !formTouched && setFormTouched(true)}
            >
              <div className="space-y-4">
                <motion.div variants={itemVariants}>
                  <Label htmlFor="room-name">Room Name *</Label>
                  <div className="relative">
                    <Film className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="room-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter room name"
                      className="pl-10"
                      required
                    />
                  </div>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Label htmlFor="video-url">Video URL *</Label>
                  <Input
                    id="video-url"
                    type="url"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="Enter video URL"
                    required
                  />
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Label htmlFor="password">Password (optional)</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password for private room"
                      className="pl-10 pr-10"
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
              </div>

              <motion.div variants={itemVariants}>
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isSubmitting || !currentUser}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating Room...
                    </>
                  ) : (
                    'Create Room'
                  )}
                </Button>
                {!currentUser && (
                  <p className="text-sm text-muted-foreground mt-2 text-center">
                    Please login to create a room
                  </p>
                )}
              </motion.div>
            </motion.form>
          </div>
        </motion.section>

      </main>
    </MainLayout>
  );
}