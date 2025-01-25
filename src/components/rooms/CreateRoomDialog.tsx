import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { MainLayout } from '../layout/MainLayout';
import sidebg from "@/assets/pexels-tima-miroshnichenko-7991182.jpg";
import { useNavigate } from 'react-router-dom';

export function CreateRoomCard() {
  const [name, setName] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [password, setPassword] = useState('');
  const [roomId] = useState(uuidv4()); 

  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!videoUrl) {
      alert('Please enter a valid video URL.');
      return;
    }

    const roomDetails = {
      id: roomId,
      name,
      videoUrl,
      password,
    };

    // Save to localStorage
    localStorage.setItem('roomDetails', JSON.stringify(roomDetails));

    // Navigate to the room page with the room ID
    navigate(`/rooms/${roomId}`);
  };

  return (
    <MainLayout>
      <main className="h-full w-full flex flex-col lg:flex-row">
        <aside className="flex-1 p-4 lg:p-10">
          <h1 className="text-2xl lg:text-3xl font-bold">Start your own theater</h1>
          <p className="text-balance text-sm text-muted-foreground mt-2">
            Create your own theater room and invite your friends
          </p>
          <form className="flex flex-col gap-4 mt-6 p-5" onSubmit={handleSubmit}>
            <div>
              <Label>Room ID:</Label>
              <Input value={roomId} readOnly className="w-full" />
            </div>
            <div>
              <Label>Room name:</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full"
              />
            </div>
            <div>
              <Label>Room password (optional):</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <Label>Video Link:</Label>
              <Input
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                required
                className="w-full"
                placeholder="e.g., https://www.youtube.com/watch?v=xyz"
              />
            </div>

            <Button type="submit" className="w-full lg:w-auto">
              Create Room
            </Button>
          </form>
        </aside>

        <div className="relative flex-1 hidden lg:flex items-center justify-center h-screen">
          <img
            src={sidebg}
            alt="Theater background"
            className="w-full h-full object-cover"
          />
        </div>
      </main>
    </MainLayout>
  );
}