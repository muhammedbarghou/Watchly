import { useRef, useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { MainLayout } from '@/components/layout/MainLayout';
import { VideoPlayer } from '@/components/room/VideoPlayer';
import { useRoom } from '@/hooks/useRoom';
import { Loader2, Users, Settings2 } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function RoomPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const videoRef = useRef<HTMLVideoElement>(null);
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  // Room state management
  const { room, loading, error, joinRoom, leaveRoom, updateVideoState } = useRoom(roomId);

  // Sync threshold for video time difference
  const syncThreshold = 2; // seconds
  const lastUpdateTime = useRef<number>(0);
  const updateDebounceTime = 500; // ms

  // Handle video state changes
  const handlePlayPause = (isPlaying: boolean) => {
    if (!room) return;
    updateVideoState({ isPlaying });
  };

  // Debounced seek handler
  const handleSeek = useCallback(
    (time: number) => {
      const now = Date.now();
      if (now - lastUpdateTime.current > updateDebounceTime) {
        lastUpdateTime.current = now;
        updateVideoState({ currentTime: time });
      }
    },
    [updateVideoState]
  );

  const handlePlaybackRateChange = (rate: number) => {
    if (!room) return;
    updateVideoState({ playbackRate: rate });
  };

  // Synchronize video state with Firestore
  useEffect(() => {
    if (!room?.videoState || !videoRef.current) return;

    const video = videoRef.current;
    const { currentTime, isPlaying, playbackRate } = room.videoState;

    // Sync current time if difference exceeds threshold
    if (Math.abs(video.currentTime - currentTime) > syncThreshold) {
      video.currentTime = currentTime;
    }

    // Sync playback rate
    if (video.playbackRate !== playbackRate) {
      video.playbackRate = playbackRate;
    }

    // Sync play/pause state with error handling
    if (isPlaying && video.paused) {
      video.play().catch((err) => {
        console.error('Error playing video:', err);
        updateVideoState({ isPlaying: false }); // Update room state if local playback fails
      });
    } else if (!isPlaying && !video.paused) {
      video.pause();
    }
  }, [room?.videoState, syncThreshold, updateVideoState]);

  // Loading state
  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="animate-spin text-primary w-8 h-8" />
        </div>
      </MainLayout>
    );
  }

  // Error or room not found
  if (error || !room) {
    return (
      <MainLayout>
        <Alert variant="destructive">
          <AlertTitle>{error || 'Room not found'}</AlertTitle>
          <AlertDescription>
            The room you are trying to access does not exist or an error occurred.
          </AlertDescription>
          <Button onClick={() => navigate('/')} variant="outline" className="mt-4">
            Return Home
          </Button>
        </Alert>
      </MainLayout>
    );
  }

  // Password protection screen
  if (!room.isPublic && !room.participants.some((p) => p.userId === currentUser?.uid)) {
    const [passwordInput, setPasswordInput] = useState('');
    const handleJoinRoom = async () => {
      try {
        await joinRoom(passwordInput);
      } catch (error) {
        console.error('Failed to join room:', error);
      }
    };

    return (
      <MainLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="w-full max-w-md p-6 space-y-4 bg-card rounded-lg border">
            <h2 className="text-2xl font-bold text-center">Enter Room Password</h2>
            <Input
              type="password"
              placeholder="Password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
            />
            <Button className="w-full" onClick={handleJoinRoom}>
              Join Room
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Leave room handler
  const handleLeaveRoom = async () => {
    try {
      await leaveRoom();
      navigate('/');
    } catch (error) {
      console.error('Failed to leave room:', error);
    }
  };

  return (
    <MainLayout>
      <div className="flex flex-col h-screen">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h1 className="text-2xl font-bold">{room.name}</h1>
            <p className="text-sm text-muted-foreground">
              Created by{' '}
              {room.participants.find((p) => p.userId === room.createdBy)?.name || 'Unknown'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Participants List */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Users className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Participants</SheetTitle>
                </SheetHeader>
                <div className="mt-4">
                  {room.participants.map((participant) => (
                    <div key={participant.userId} className="flex items-center justify-between py-2">
                      <span>{participant.name}</span>
                      <span className="text-sm text-muted-foreground">{participant.role}</span>
                    </div>
                  ))}
                </div>
              </SheetContent>
            </Sheet>

            {/* Room Settings (for admin only) */}
            {room.createdBy === currentUser?.uid && (
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Settings2 className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Room Settings</SheetTitle>
                  </SheetHeader>
                  <div className="mt-4 space-y-4">
                    {/* Add room settings here */}
                  </div>
                </SheetContent>
              </Sheet>
            )}

            {/* Leave Room Button */}
            <Button variant="destructive" onClick={handleLeaveRoom}>
              Leave Room
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Video Section */}
          <div className="flex-1 bg-black">
            <VideoPlayer
              ref={videoRef}
              url={room?.videoUrl}
              playing={room?.videoState.isPlaying}
              currentTime={room?.videoState.currentTime}
              playbackRate={room?.videoState.playbackRate}
              onPlayPause={handlePlayPause}
              onSeek={handleSeek}
              onPlaybackRateChange={handlePlaybackRateChange}
            />
          </div>

          {/* Chat Section (Uncomment if needed) */}
          {/* <div className="w-96 border-l">
            <ChatPanel roomId={roomId!} currentUser={currentUser} participants={room?.participants || []} />
          </div> */}
        </div>
      </div>
    </MainLayout>
  );
}

export default RoomPage;