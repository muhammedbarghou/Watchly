import { useState, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner'; // Import toast from sonner
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { MainLayout } from '../layout/MainLayout';
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Generate room ID only once on component mount
  const roomId = useMemo(() => uuidv4(), []);

  const validateForm = () => {
    if (!name.trim()) {
      toast.error('Please enter a room name');
      return false;
    }

    if (!videoUrl.trim()) {
      toast.error('Please enter a video URL');
      return false;
    }

    if (!YOUTUBE_REGEX.test(videoUrl)) {
      toast.error('Please enter a valid YouTube URL');
      return false;
    }

    return true;
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

      // Save to localStorage with unique key
      localStorage.setItem(`room-${roomId}`, JSON.stringify(roomDetails));
      toast.success('Room created successfully!');

      // Navigate to the room page after short delay
      setTimeout(() => navigate(`/rooms/${roomId}`), 1000);
    } catch (error) {
      toast.error('Failed to create room. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <main className="h-screen flex flex-col lg:flex-row">
        <section className="flex-1 p-6 lg:p-12 flex flex-col justify-center">
          <div className="max-w-2xl mx-auto w-full">
            <header className="mb-8">
              <h1 className="text-3xl lg:text-4xl font-bold text-primary">
                Create Your Theater Room
              </h1>
              <p className="text-muted-foreground mt-2">
                Set up a shared viewing experience with friends
              </p>
            </header>

            <form 
              onSubmit={handleSubmit}
              className="space-y-6 bg-card rounded-xl p-6 shadow-lg"
            >
              <div className="space-y-4">
                <div>
                  <Label htmlFor="room-id">Room ID</Label>
                  <Input
                    id="room-id"
                    value={roomId}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Share this ID with your friends
                  </p>
                </div>

                <div>
                  <Label htmlFor="room-name">Room Name *</Label>
                  <Input
                    id="room-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter room name"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="video-url">YouTube Video URL *</Label>
                  <Input
                    id="video-url"
                    type="url"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="password">Password (optional)</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password for private room"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating Room...' : 'Create Room'}
              </Button>
            </form>
          </div>
        </section>

        <aside className="hidden lg:block flex-1 relative">
          <img
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