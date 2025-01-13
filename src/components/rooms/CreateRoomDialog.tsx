import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';

interface CreateRoomDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; videoUrl: string }) => void;
}

export function CreateRoomDialog({ isOpen, onClose, onSubmit }: CreateRoomDialogProps) {
  const [name, setName] = React.useState('');
  const [videoUrl, setVideoUrl] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, videoUrl });
    setName('');
    setVideoUrl('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Watch Room</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-200">
              Room Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full rounded-md border border-netflix-gray bg-netflix-black text-white px-3 py-2 focus:border-netflix-red focus:ring-netflix-red"
              required
            />
          </div>

          <div>
            <label htmlFor="videoUrl" className="block text-sm font-medium text-gray-200">
              Video URL
            </label>
            <input
              type="url"
              id="videoUrl"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              className="mt-1 block w-full rounded-md border border-netflix-gray bg-netflix-black text-white px-3 py-2 focus:border-netflix-red focus:ring-netflix-red"
              required
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Create Room
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}