import { useState, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MainLayout } from '@/components/layout/MainLayout';
import { Loader2, Copy, Film, Lock, Eye, EyeOff } from 'lucide-react';
import sidebg from "@/assets/pexels-tima-miroshnichenko-7991182.jpg";

type RoomDetails = {
  id: string;
  name: string;
  videoUrl: string;
  password?: string;
  createdAt: Date;
};

const YOUTUBE_REGEX = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;

export function CreateRoomCard() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formTouched, setFormTouched] = useState(false);
  
  const roomId = useMemo(() => uuidv4(), []);

  const getYoutubeVideoId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    return match?.[1] || null;
  };

  const validateForm = () => {
    const errors: string[] = [];

    if (!name.trim()) {
      errors.push('Please enter a room name');
    } else if (name.length < 3) {
      errors.push('Room name must be at least 3 characters long');
    }

    if (!videoUrl.trim()) {
      errors.push('Please enter a video URL');
    } else if (!YOUTUBE_REGEX.test(videoUrl)) {
      errors.push('Please enter a valid YouTube URL');
    } else if (!getYoutubeVideoId(videoUrl)) {
      errors.push('Could not extract valid YouTube video ID');
    }

    if (password && password.length < 4) {
      errors.push('Password must be at least 4 characters long');
    }

    if (errors.length > 0) {
      errors.forEach(error => toast.error(error));
      return false;
    }

    return true;
  };

  const handleCopyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    toast.success('Room ID copied to clipboard!');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!validateForm()) {
      setIsSubmitting(false);
      return;
    }

    try {
      const roomDetails: RoomDetails = {
        id: roomId,
        name: name.trim(),
        videoUrl: videoUrl.trim(),
        password: password.trim() || undefined,
        createdAt: new Date(),
      };

      localStorage.setItem(`room-${roomId}`, JSON.stringify(roomDetails));
      toast.success('Room created successfully! Redirecting...');

      setTimeout(() => navigate(`/rooms/${roomId}`), 1500);
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
                  <Label htmlFor="room-id">Room ID</Label>
                  <div className="relative">
                    <Input
                      id="room-id"
                      value={roomId}
                      readOnly
                      className="font-mono text-sm pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 -translate-y-1/2"
                      onClick={handleCopyRoomId}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Share this ID with your friends
                  </p>
                </motion.div>

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
                  <Label htmlFor="video-url">YouTube Video URL *</Label>
                  <Input
                    id="video-url"
                    type="url"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    required
                  />
                  {videoUrl && getYoutubeVideoId(videoUrl) && (
                    <p className="text-xs text-green-500 mt-1">
                      ✓ Valid YouTube URL
                    </p>
                  )}
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
                  disabled={isSubmitting}
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
              </motion.div>
            </motion.form>
          </div>
        </motion.section>

        <aside className="hidden lg:block flex-1 relative">
          <motion.img
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            src={sidebg}
            alt="People watching movie together"
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-transparent" />
        </aside>
      </main>
    </MainLayout>
  );
}