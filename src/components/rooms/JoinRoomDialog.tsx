import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';

interface JoinRoomDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (roomId: string) => void;
}

export function JoinRoomDialog({ isOpen, onClose, onSubmit }: JoinRoomDialogProps) {
  const [roomId, setRoomId] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(roomId);
    setRoomId('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Join Watch Room</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="roomId" className="block text-sm font-medium text-gray-200">
              Room ID
            </label>
            <input
              type="text"
              id="roomId"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              className="mt-1 block w-full rounded-md border border-netflix-gray bg-netflix-black text-white px-3 py-2 focus:border-netflix-red focus:ring-netflix-red"
              required
            />
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Join Room
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}