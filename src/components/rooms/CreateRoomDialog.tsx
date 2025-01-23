import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { MainLayout } from '../layout/MainLayout';
import sidebg from "@/assets/pexels-tima-miroshnichenko-7991182.jpg";
import { createRoomAsync } from '@/slices/roomSlice'; 
import { AppDispatch, RootState } from '@/store/Store';
import { useNavigate } from 'react-router-dom';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/use-auth';



export function CreateRoomCard() {
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error } = useSelector((state: RootState) => state.room); 
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const customUID = currentUser?.customUID;

  

  const [key, setKey] = useState('');
  const [name, setName] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [password, setPassword] = useState('');

  const generateId = () => {
    const newId = Math.floor(Math.random() * 100000000).toString();
    setKey(newId);
  };

  useEffect(() => {
    generateId();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const roomData = {
      key,
      name,
      videoUrl,
      password,
      createdBy: 'user-id',
    };

    try {
      const docRef = await addDoc(collection(db, 'rooms'), roomData);
      console.log('Room created with ID:', docRef.id);

      await dispatch(createRoomAsync(roomData)).unwrap();

      navigate(`/rooms/${docRef.id}`, { state: { videoUrl } });
    } catch (err) {
      console.error('Failed to create room:', err);
    }
  };

  return (
    <MainLayout>
      <main className='h-full w-full flex flex-col lg:flex-row'>
        <aside className='flex-1 p-4 lg:p-10 '>
          <h1 className='text-2xl lg:text-3xl font-bold'>Start your own theater</h1>
          <p className='text-balance text-sm text-muted-foreground mt-2'>
            Create your own theater room and invite your friends
          </p>
          <form onSubmit={handleSubmit} className='flex flex-col gap-4 mt-6 p-5'>
            <div>
              <Label>Room ID:</Label>
              <Input
                value={key}
                readOnly
                className='w-full'
              />
            </div>
            <div>
              <Label>Room name:</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className='w-full'
              />
            </div>
            <div>
              <Label>Room password (optional):</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className='w-full'
              />
            </div>
            <div>
              <Label>Video Link:</Label>
              <Input
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                required
                className='w-full'
              />
            </div>
            {error && <p className='text-red-500 text-sm'>{error}</p>}
            <Button type="submit" disabled={loading} className='w-full lg:w-auto'>
              {loading ? 'Creating...' : 'Create Room'}
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