import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

interface CreateRoomCardProps {
  onSubmit: (data: { name: string; videoUrl: string; password?: string }) => void;
}

export function CreateRoomCard({ onSubmit }: CreateRoomCardProps) {
  const [name, setName] = React.useState('');
  const [videoUrl, setVideoUrl] = React.useState('');
  const [password, setPassword] = React.useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit({ name, videoUrl, password });
  };

  return (
    <Card className="w-full bg-netflix-dark p-6">
      <CardHeader>
        <CardTitle className="">Create Room</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Room Name</Label>
            <Input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1"
              required
            />
          </div>
          <div>
            <Label htmlFor="videoUrl">Video URL</Label>
            <Input
              type="url"
              id="videoUrl"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
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
              Create Room
            </Button>
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  );
}