// src/components/room/JoinRoomRequest.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Lock, Key, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

interface JoinRoomRequestProps {
  roomId: string;
  roomName: string;
  hasPassword: boolean;
  onJoin: (password?: string) => Promise<boolean>;
  onCancel: () => void;
}

export function JoinRoomRequest({ 
  roomId, 
  roomName, 
  hasPassword, 
  onJoin,
  onCancel
}: JoinRoomRequestProps) {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (hasPassword && !password) {
      toast.error('Please enter the room password');
      return;
    }
    
    setLoading(true);
    
    try {
      const success = await onJoin(hasPassword ? password : undefined);
      
      if (success) {
        navigate(`/room/${roomId}?source=invitation`);
      } else {
        toast.error('Failed to join room. Incorrect password or the room no longer exists.');
      }
    } catch (error) {
      console.error('Error joining room:', error);
      toast.error('Failed to join room');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-xl">Join Room</CardTitle>
        <CardDescription>
          You're joining "{roomName}"
        </CardDescription>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {hasPassword ? (
            <>
              <div className="flex items-center gap-2 p-3 bg-amber-100 dark:bg-amber-950/30 rounded-md text-amber-800 dark:text-amber-400">
                <Lock className="h-5 w-5 flex-shrink-0" />
                <p className="text-sm">This room is password protected</p>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="password">
                  Room Password
                </label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter room password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </>
          ) : (
            <p className="text-center py-2">
              Click "Join" to enter the room.
            </p>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          
          <Button type="submit" disabled={loading}>
            {loading ? 'Joining...' : 'Join Room'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}