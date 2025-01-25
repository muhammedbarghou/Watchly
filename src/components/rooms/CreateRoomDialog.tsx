import  { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { MainLayout } from '../layout/MainLayout';
import sidebg from "@/assets/pexels-tima-miroshnichenko-7991182.jpg";

export function CreateRoomCard() {

  


  const [name, setName] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [password, setPassword] = useState('');



  return (
    <MainLayout>
      <main className='h-full w-full flex flex-col lg:flex-row'>
        <aside className='flex-1 p-4 lg:p-10 '>
          <h1 className='text-2xl lg:text-3xl font-bold'>Start your own theater</h1>
          <p className='text-balance text-sm text-muted-foreground mt-2'>
            Create your own theater room and invite your friends
          </p>
          <form className='flex flex-col gap-4 mt-6 p-5'>
            <div>
              <Label>Room ID:</Label>
              <Input
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

            <Button 
              type="submit" 
              className='w-full lg:w-auto'
            >
              create room
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