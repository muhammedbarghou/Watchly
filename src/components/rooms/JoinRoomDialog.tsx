import React from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { MainLayout } from '../layout/MainLayout';
import sidebg from "@/assets/pexels-tima-miroshnichenko-7991182.jpg";

interface JoinRoomCardProps {
  loading?: boolean;
  error?: string | null;
}

export function JoinRoomCard({  loading, error }: JoinRoomCardProps) {
  const [roomId, setRoomId] = React.useState('');
  const [password, setPassword] = React.useState('');


  return (
    <MainLayout>
      <main className='h-full w-full flex flex-col lg:flex-row'>
        <aside className='flex-1 p-4 lg:p-10 justify-center flex flex-col gap-4'>
          <h1 className='text-2xl lg:text-3xl font-bold'>Join a Theater Room</h1>
          <p className='text-balance text-sm text-muted-foreground mt-2'>
            Enter the room ID and password (if required) to join an existing theater room.
          </p>
          <form  className='flex flex-col gap-4 mt-6'>
            <div>
              <Label>Room ID:</Label>
              <Input
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                required
                className='w-full'
                placeholder="Enter Room ID"
              />
            </div>
            <div>
              <Label>Room password (optional):</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className='w-full'
                placeholder="Enter Password"
              />
            </div>
            {error && <p className='text-red-500 text-sm'>{error}</p>}
            <Button type="submit" disabled={loading} className='w-full lg:w-auto'>
              {loading ? 'Joining...' : 'Join Room'}
            </Button>
          </form>
        </aside>

        <div className="relative flex-1 hidden lg:flex items-center justify-center h-screen">
          <img
            src={sidebg}
            alt="Theater background"
            className='w-full h-full object-cover'
          />
        </div>
      </main>
    </MainLayout>
  );
}