import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

interface JoinRoomCardProps {
  onSubmit: (data: { roomId: string; password?: string }) => void;
  loading?: boolean ; // Add loading prop
  error?: string | null;
}

export function JoinRoomCard({ onSubmit, loading, error }: JoinRoomCardProps) {
  const [roomId, setRoomId] = React.useState('');
  const [password, setPassword] = React.useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit({ roomId, password });
  };

  return (
    <Card className="w-full bg-netflix-dark p-6">
      <CardHeader>
        <CardTitle className="text-white">Join Room</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="roomId" className="text-white">
              Room ID
            </Label>
            <Input
              type="text"
              id="roomId"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              className="mt-1 bg-netflix-dark text-white"
              required
            />
          </div>
          <div>
            <Label htmlFor="password" className="text-white">
              Password (optional)
            </Label>
            <Input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 bg-netflix-dark text-white"
            />
          </div>
          {/* Display error message if there's an error */}
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <CardFooter className="flex justify-end">
            <Button
              type="submit"
              className="bg-netflix-red hover:bg-netflix-dark-red text-white"
              disabled={loading} // Disable the button when loading
            >
              {loading ? 'Joining...' : 'Join Room'}
            </Button>
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  );
}