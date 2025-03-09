import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch'; // Import Switch component
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import MainLayout from '@/components/layout/MainLayout';
import { nanoid } from 'nanoid';

// Updated Room Interface
interface Room {
  name: string;
  roomId: string;
  createdBy: string;
  videoUrl: string;
  password?: string;
  createdAt: any;
  updatedAt: any;
  voiceChatEnabled: boolean; // Added voice chat field
}

export function CreateRoomPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [name, setName] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [password, setPassword] = useState('');
  const [voiceChatEnabled, setVoiceChatEnabled] = useState(false); // State for voice chat toggle
  const [isSubmitting, setIsSubmitting] = useState(false);

  const roomId = useMemo(() => nanoid(6), []);

  const validateForm = () => {
    const errors: string[] = [];

    if (!currentUser) {
      errors.push('You must be logged in to create a room');
    }

    if (!name.trim()) {
      errors.push('Room name is required');
    } else if (name.length < 3) {
      errors.push('Room name must be at least 3 characters');
    }

    if (!videoUrl.trim()) {
      errors.push('Video URL is required');
    }

    if (errors.length > 0) {
      errors.forEach((error) => toast.error(error));
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;
    if (!currentUser) return;

    setIsSubmitting(true);

    try {
      const roomData: Room = {
        name,
        roomId,
        videoUrl,
        createdBy: currentUser.displayName || 'Anonymous',
        ...(password ? { password } : {}),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        voiceChatEnabled, // Add voice chat setting to room data
      };

      await addDoc(collection(db, 'rooms'), roomData);
      toast.success(`Room created successfully! Room Key: ${roomId}`);
      navigate(`/room/${roomId}`);
    } catch (error) {
      console.error('Room creation error:', error);
      toast.error(`Failed to create room: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <div className="container max-w-md mx-auto py-10 px-4">
        <Card className="border-2 border-primary/10">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">Create Watch Party</CardTitle>
            <CardDescription>
              Create a room to watch together
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {/* Room Name Input */}
              <div className="space-y-2">
                <Label htmlFor="name">Room Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="My Watch Party"
                  disabled={isSubmitting}
                />
              </div>

              {/* Video URL Input */}
              <div className="space-y-2">
                <Label htmlFor="videoUrl">Video URL</Label>
                <Input
                  id="videoUrl"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="Enter video URL"
                  disabled={isSubmitting}
                />
                <p className="text-sm text-muted-foreground">
                  Enter a valid video URL (e.g., YouTube, Vimeo)
                </p>
              </div>

              {/* Voice Chat Toggle */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="voiceChatEnabled">Voice Chat</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable voice communications in this room
                  </p>
                </div>
                <Switch
                  id="voiceChatEnabled"
                  checked={voiceChatEnabled}
                  onCheckedChange={setVoiceChatEnabled}
                  disabled={isSubmitting}
                />
              </div>

              {/* Room Key Display */}
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">Room Key</h3>
                    <p className="text-sm text-muted-foreground">Share with friends</p>
                  </div>
                  <div className="bg-background px-4 py-2 rounded-md font-mono">
                    {roomId}
                  </div>
                </div>
              </div>

              {/* Optional Password */}
              <div className="space-y-2">
                <Label htmlFor="password">Password (Optional)</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Room password"
                  disabled={isSubmitting}
                />
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-4">
              <Button 
                type="submit" 
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Room'
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </MainLayout>
  );
}

export default CreateRoomPage;