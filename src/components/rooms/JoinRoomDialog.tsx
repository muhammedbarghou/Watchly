import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { MainLayout } from '../layout/MainLayout';
import sidebg from "@/assets/pexels-tima-miroshnichenko-7991182.jpg";
import { useAuth } from '@/hooks/use-auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { joinRoomAsync } from '@/slices/roomSlice';
import { AppDispatch } from '@/store/Store';

interface JoinRoomCardProps {
  loading?: boolean;
  error?: string | null;
}

export function JoinRoomCard({ 
  loading: initialLoading, 
  error: initialError 
}: JoinRoomCardProps) {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { currentUser } = useAuth();
  
  const [roomKey, setRoomKey] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleJoinRoom = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!currentUser) {
      navigate('/login');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const roomsRef = collection(db, 'rooms');
      const q = query(roomsRef, where('key', '==', roomKey));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError('Room not found');
        setLoading(false);
        return;
      }

      const roomDoc = querySnapshot.docs[0];
      const roomData = roomDoc.data();

      if (roomData.password && roomData.password !== password) {
        setError('Incorrect room password');
        setLoading(false);
        return;
      }

      await dispatch(joinRoomAsync({ 
        roomId: roomDoc.id, 
        userId: currentUser.uid 
      })).unwrap();

      navigate(`/rooms/${roomDoc.id}`, { 
        state: { 
          videoUrl: roomData.videoUrl 
        } 
      });

    } catch (err: any) {
      setError(err.message || 'Failed to join room');
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <main className='h-full w-full flex flex-col lg:flex-row'>
        <aside className='flex-1 p-4 lg:p-10 justify-center flex flex-col gap-4'>
          <h1 className='text-2xl lg:text-3xl font-bold'>Join a Theater Room</h1>
          <p className='text-balance text-sm text-muted-foreground mt-2'>
            Enter the room key and password (if required) to join an existing theater room.
          </p>
          <form onSubmit={handleJoinRoom} className='flex flex-col gap-4 mt-6'>
            <div>
              <Label>Room Key:</Label>
              <Input
                value={roomKey}
                onChange={(e) => setRoomKey(e.target.value)}
                required
                className='w-full'
                placeholder="Enter Room Key"
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
            {(error || initialError) && (
              <p className='text-red-500 text-sm'>
                {error || initialError}
              </p>
            )}
            <Button 
              type="submit" 
              disabled={loading || initialLoading} 
              className='w-full lg:w-auto'
            >
              {loading || initialLoading ? 'Joining...' : 'Join Room'}
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