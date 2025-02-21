import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { useRoom } from '@/hooks/useRoom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MainLayout } from '@/components/layout/MainLayout';
import { Globe2, Loader2,Lock} from 'lucide-react';


export function CreateRoomPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { createRoom, loading: isSubmitting } = useRoom();

  // Form State
  const [name, setName] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [password, setPassword] = useState('');

  // Validation Logic
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

  // Handle Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || !currentUser?.uid) return;

    try {
      const roomData = {
        name: name.trim(),
        videoUrl: videoUrl.trim(),
        isPublic,
        password: isPublic ? undefined : password,
      };

      const newRoomId = await createRoom(roomData);
      toast.success('Room created successfully!');
      navigate(`/room/${newRoomId}`);
    } catch (error) {
      toast.error('Failed to create room. Please try again.');
    }
  };

  return (
    <MainLayout>
      <div className="space-y-8 backdrop-blur-xl bg-black/40 dark:bg-black/60 rounded-xl p-8 shadow-2xl border border-primary/10 dark:border-primary/5">
        {/* Header */}
        <h2 className="text-2xl font-bold text-center">Create Your Theater Room</h2>
        <p className="text-sm text-center text-muted-foreground">
          Set up a synchronized viewing experience and invite friends to watch together in real-time.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Room Name */}
          <div>
            <Label>Room Name</Label>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter a memorable name for your room"
              required
            />
          </div>

          {/* Video URL */}
          <div>
            <Label>Video URL</Label>
            <Input
              type="url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="Paste the video URL you want to watch"
              required
            />
          </div>

          {/* Public/Private Toggle */}
          <div className="flex items-center justify-between">
            <Label>Public Room</Label>
            <Button
              variant="ghost"
              onClick={(e) => {
                e.preventDefault();
                setIsPublic(!isPublic);
              }}
            >
              {isPublic ? <Globe2 /> : <Lock />}
            </Button>
            <span className="text-sm text-muted-foreground">
              {isPublic ? 'Anyone can join with the link' : 'Password protected access'}
            </span>
          </div>

          {/* Password Field (for private rooms) */}
          {!isPublic && (
            <div>
              <Label>Room Password</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Set a password for your private room"
                required
              />
            </div>
          )}

          {/* Submit Button */}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2 className="animate-spin mr-2" />
            ) : (
              'Create Theater Room'
            )}
          </Button>

          {/* Login Prompt */}
          {!currentUser && (
            <p className="text-center text-sm text-red-500">
              Please log in to create a room.
            </p>
          )}
        </form>
      </div>
    </MainLayout>
  );
}

export default CreateRoomPage;