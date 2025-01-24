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
import { useAuth } from '@/hooks/use-auth';

export function CreateRoomCard() {
  const dispatch = useDispatch<AppDispatch>();
  const { loading: roomLoading, error: roomError } = useSelector((state: RootState) => state.room); 
  const navigate = useNavigate();
  
  const { 
    currentUser, 
    userProfile, 
    loading: authLoading 
  } = useAuth();

  const [key, setKey] = useState('');
  const [name, setName] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [password, setPassword] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);

  const generateId = () => {
    const newId = Math.floor(Math.random() * 100000000).toString();
    setKey(newId);
  };

  useEffect(() => {
    generateId();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitError(null);

    const urlRegex = /^(https?:\/\/)?(www\.)?([a-zA-Z0-9_-]+)+(\.[a-zA-Z]{2,})+(\/.*)?$/;
    if (!urlRegex.test(videoUrl)) {
      setSubmitError('Please enter a valid video URL.');
      return;
    }

    const roomData = {
      key,
      name,
      videoUrl,
      password,
      createdBy: userProfile?.customUID || currentUser?.uid || 'anonymous',
      creatorName: userProfile?.displayName || currentUser?.displayName || 'Anonymous User',
      participants: [
        {
          uid: userProfile?.customUID || currentUser?.uid,
          displayName: userProfile?.displayName || currentUser?.displayName,
          email: currentUser?.email,
          photoURL: currentUser?.photoURL
        }
      ]
    };

    try {
      const room = await dispatch(createRoomAsync(roomData)).unwrap();
      if (room?.id) {
        navigate(`/rooms/${room.id}`, { state: { videoUrl } });
      }
    } catch (err: any) {
      console.error('Failed to create room:', err);
      setSubmitError(err.message || 'An error occurred while creating the room. Please try again.');
    }
  };

  const isFormDisabled = roomLoading || authLoading || !currentUser;

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
                disabled={isFormDisabled}
                className='w-full'
              />
            </div>
            <div>
              <Label>Room password (optional):</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isFormDisabled}
                className='w-full'
              />
            </div>
            <div>
              <Label>Video Link:</Label>
              <Input
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                required
                disabled={isFormDisabled}
                className='w-full'
              />
            </div>
            {(roomError || submitError) && (
              <p className='text-red-500 text-sm'>
                {submitError || roomError}
              </p>
            )}
            <Button 
              type="submit" 
              disabled={isFormDisabled} 
              className='w-full lg:w-auto'
            >
              {roomLoading ? 'Creating...' : 'Create Room'}
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
