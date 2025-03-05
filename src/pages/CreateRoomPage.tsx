import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { Globe2, Loader2, Lock, Settings, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Tabs, TabsContent, TabsList, TabsTrigger, } from '@/components/ui/tabs';
import { Separator } from '@radix-ui/react-separator';
import MainLayout from '@/components/layout/MainLayout';

// Room Interface
interface Room {
  name: string;
  key: string;
  videoUrl: string;
  createdBy: string;
  isPrivate: boolean;
  password?: string;
  participants: {
    [userId: string]: {
      role: 'admin' | 'viewer' | 'moderator';
      joinedAt: any;
    };
  };
  settings: {
    maxParticipants: number;
    allowSkip: boolean;
    allowPlaybackControl: boolean;
    chatEnabled: boolean;
    autoCleanup: boolean;
  };
  metadata: {
    description?: string;
    tags?: string[];
    category?: string;
  };
  status: 'active' | 'paused' | 'closed';
  createdAt: any;
  updatedAt: any;
}

export function CreateRoomPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [name, setName] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [description, setDescription] = useState('');
  const [maxParticipants, setMaxParticipants] = useState(10);
  const [allowSkip, setAllowSkip] = useState(true);
  const [allowPlaybackControl, setAllowPlaybackControl] = useState(true);
  const [chatEnabled, setChatEnabled] = useState(true);
  const [autoCleanup, setAutoCleanup] = useState(false);
  const [category, setCategory] = useState('general');

  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(['watch-party']);

  const key = useMemo(() => uuidv4().split('-')[0], []);

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

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

    if (errors.length > 0) {
      errors.forEach((error) => toast.error(error));
      return false;
    }
    return true;
  };

  // Handle Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) return;

    // Ensure we have a current user
    if (!currentUser) {
      toast.error('You must be logged in');
      return;
    }

    // Start submission
    setIsSubmitting(true);

    try {
      // Prepare room data
      const roomData: Room = {
        name,
        key,
        videoUrl,
        createdBy: currentUser.uid,
        isPrivate: !isPublic,
        ...(isPublic ? {} : { password }), // Conditionally add password
        participants: {
          [currentUser.uid]: {
            role: 'admin',
            joinedAt: serverTimestamp(),
          },
        },
        settings: {
          maxParticipants,
          allowSkip,
          allowPlaybackControl,
          chatEnabled,
          autoCleanup,
        },
        metadata: {
          description: description || `Watch party created by ${currentUser.displayName}`,
          tags,
          category,
        },
        status: 'active',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      // Add room to Firestore
      const roomRef = await addDoc(collection(db, 'rooms'), roomData);

      // Show success toast
      toast.success(`Room created successfully! Room Key: ${key}`);

      // Navigate to the new room
      navigate(`/room/${key}`);
    } catch (error) {
      console.error('Room creation error:', error);
      toast.error(`Failed to create room: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <div className="container max-w-4xl mx-auto py-10 px-4">
        <Card className="border-2 border-primary/10">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">Create Watch Party</CardTitle>
            <CardDescription>
              Set up a synchronized video watching experience with friends
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <Tabs defaultValue="basic" className="w-full">
              <div className="px-6">
                <TabsList className="grid w-full grid-cols-3 mb-6">
                  <TabsTrigger value="basic" className="flex items-center gap-2">
                    <Link className="h-4 w-4" to={''} />
                    Basic Info
                  </TabsTrigger>
                  <TabsTrigger value="settings" className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Room Settings
                  </TabsTrigger>
                  <TabsTrigger value="metadata" className="flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Metadata
                  </TabsTrigger>
                </TabsList>
              </div>

              <CardContent>
                <TabsContent value="basic" className="space-y-6 mt-0">
                  {/* Room Name Input */}
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-base">Room Name</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="My Awesome Watch Party"
                      disabled={isSubmitting}
                      className="h-12"
                    />
                  </div>

                  {/* Video URL Input */}
                  <div className="space-y-2">
                    <Label htmlFor="videoUrl" className="text-base">Video URL</Label>
                    <Input
                      id="videoUrl"
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      placeholder="https://example.com/video"
                      disabled={isSubmitting}
                      className="h-12"
                    />
                    <p className="text-sm text-muted-foreground">
                      Enter the URL of the video you want to watch together
                    </p>
                  </div>

                  {/* Room Key Display */}
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">Your Room Key</h3>
                        <p className="text-sm text-muted-foreground">Share this with friends to join</p>
                      </div>
                      <div className="bg-background px-4 py-2 rounded-md font-mono text-lg">
                        {key}
                      </div>
                    </div>
                  </div>

                  {/* Privacy Toggle */}
                  <div className="space-y-3">
                    <Label className="text-base">Room Privacy</Label>
                    <div className="flex items-center space-x-3">
                      <Button
                        type="button"
                        variant={isPublic ? "default" : "outline"}
                        onClick={() => setIsPublic(true)}
                        className="flex-1 h-12"
                      >
                        <Globe2 className="mr-2 h-5 w-5" />
                        Public Room
                      </Button>
                      <Button
                        type="button"
                        variant={!isPublic ? "default" : "outline"}
                        onClick={() => setIsPublic(false)}
                        className="flex-1 h-12"
                      >
                        <Lock className="mr-2 h-5 w-5" />
                        Private Room
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {isPublic 
                        ? "Anyone with the room key can join" 
                        : "Requires a password to join"}
                    </p>
                  </div>

                  {/* Password Input (if private) */}
                  {!isPublic && (
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-base">Room Password</Label>
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter room password"
                        disabled={isSubmitting}
                        className="h-12"
                      />
                      <p className="text-sm text-muted-foreground">
                        Password must be at least 4 characters
                      </p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="settings" className="space-y-6 mt-0">
                  {/* Max Participants */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="maxParticipants" className="text-base">Max Participants</Label>
                      <span className="font-medium">{maxParticipants}</span>
                    </div>
                    <Slider
                      id="maxParticipants"
                      min={2}
                      max={50}
                      step={1}
                      value={[maxParticipants]}
                      onValueChange={(value) => setMaxParticipants(value[0])}
                      disabled={isSubmitting}
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>2</span>
                      <span>50</span>
                    </div>
                  </div>

                  <Separator />

                  {/* Toggle Settings */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="allowSkip" className="text-base">Allow Skipping</Label>
                        <p className="text-sm text-muted-foreground">
                          Let participants skip ahead in the video
                        </p>
                      </div>
                      <Switch
                        id="allowSkip"
                        checked={allowSkip}
                        onCheckedChange={setAllowSkip}
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="allowPlaybackControl" className="text-base">Playback Control</Label>
                        <p className="text-sm text-muted-foreground">
                          Allow participants to play/pause the video
                        </p>
                      </div>
                      <Switch
                        id="allowPlaybackControl"
                        checked={allowPlaybackControl}
                        onCheckedChange={setAllowPlaybackControl}
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="chatEnabled" className="text-base">Enable Chat</Label>
                        <p className="text-sm text-muted-foreground">
                          Allow participants to chat during the watch party
                        </p>
                      </div>
                      <Switch
                        id="chatEnabled"
                        checked={chatEnabled}
                        onCheckedChange={setChatEnabled}
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="autoCleanup" className="text-base">Auto Cleanup</Label>
                        <p className="text-sm text-muted-foreground">
                          Automatically delete room when everyone leaves
                        </p>
                      </div>
                      <Switch
                        id="autoCleanup"
                        checked={autoCleanup}
                        onCheckedChange={setAutoCleanup}
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="metadata" className="space-y-6 mt-0">
                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-base">Description</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe what you'll be watching..."
                      disabled={isSubmitting}
                      className="min-h-24"
                    />
                  </div>

                  {/* Category */}
                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-base">Category</Label>
                    <Select
                      value={category}
                      onValueChange={setCategory}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="movies">Movies</SelectItem>
                        <SelectItem value="tv-shows">TV Shows</SelectItem>
                        <SelectItem value="anime">Anime</SelectItem>
                        <SelectItem value="sports">Sports</SelectItem>
                        <SelectItem value="education">Education</SelectItem>
                        <SelectItem value="gaming">Gaming</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Tags */}
                  <div className="space-y-2">
                    <Label htmlFor="tags" className="text-base">Tags</Label>
                    <div className="flex gap-2">
                      <Input
                        id="tags"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        placeholder="Add a tag"
                        disabled={isSubmitting}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addTag();
                          }
                        }}
                      />
                      <Button 
                        type="button" 
                        onClick={addTag}
                        disabled={isSubmitting || !tagInput.trim()}
                      >
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="px-3 py-1 text-sm">
                          {tag}
                          <button
                            type="button"
                            className="ml-2 text-muted-foreground hover:text-foreground"
                            onClick={() => removeTag(tag)}
                            disabled={isSubmitting}
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </CardContent>

              <CardFooter className="flex flex-col gap-4 px-6 pb-6">
                <Button 
                  type="submit" 
                  className="w-full h-12 text-base"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Creating Room...
                    </>
                  ) : (
                    'Create Watch Party'
                  )}
                </Button>
              </CardFooter>
            </Tabs>
          </form>
        </Card>
      </div>
    </MainLayout>
  );
}

export default CreateRoomPage;