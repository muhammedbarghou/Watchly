import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

interface JoinRoomCardProps {
  onSubmit: (data: { roomId: string; password?: string }) => void;
}

export function JoinRoomCard({ onSubmit }: JoinRoomCardProps) {
  const [roomId, setRoomId] = React.useState('');
  const [password, setPassword] = React.useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit({ roomId, password });
  };

  return (
    <Card className="w-full bg-netflix-dark p-6">
      <CardHeader>
        <CardTitle className="">Join Room</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="roomId">Room ID</Label>
            <Input
              type="text"
              id="roomId"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              className="mt-1"
              required
            />
          </div>
          <div>
            <Label htmlFor="password">Password (optional)</Label>
            <Input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1"
            />
          </div>
          <CardFooter className="flex justify-end">
            <Button type="submit" className="bg-netflix-red hover:bg-netflix-dark-red text-white">
              Join Room
            </Button>
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  );
}