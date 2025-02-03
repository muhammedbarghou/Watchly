import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { MainLayout } from '../layout/MainLayout';
import sidebg from "@/assets/pexels-tima-miroshnichenko-7991182.jpg";

type RoomDetails = {
  id: string;
  password?: string;
  // Add other room details as needed
};

export function JoinRoomCard() {
  const navigate = useNavigate();
  const [roomKey, setRoomKey] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!roomKey.trim()) {
        toast.error('Please enter a room key');
        return;
      }

      // Check if room exists in localStorage
      const roomData = localStorage.getItem(`room-${roomKey}`);
      if (!roomData) {
        toast.error('Room not found');
        return;
      }

      const roomDetails: RoomDetails = JSON.parse(roomData);
      
      // Check password if required
      if (roomDetails.password && roomDetails.password !== password.trim()) {
        toast.error('Incorrect password');
        return;
      }

      toast.success('Joining room...');
      navigate(`/rooms/${roomKey}`);
    } catch (error) {
      toast.error('Failed to join room. Please try again.');
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
                Join a Theater Room
              </h1>
              <p className="text-muted-foreground mt-2">
                Enter the room key and password to join an existing theater
              </p>
            </header>

            <form 
              onSubmit={handleSubmit}
              className="space-y-6 bg-card rounded-xl p-6 shadow-lg"
            >
              <div className="space-y-4">
                <div>
                  <Label htmlFor="room-key">Room Key *</Label>
                  <Input
                    id="room-key"
                    value={roomKey}
                    onChange={(e) => setRoomKey(e.target.value)}
                    placeholder="Enter room key"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="password">Password (if required)</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter room password"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Joining...' : 'Join Room'}
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