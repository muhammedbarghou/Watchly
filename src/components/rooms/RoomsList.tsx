import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, UserPlus } from 'lucide-react';
import { Button } from '../ui/button';
import { CreateRoomDialog } from './CreateRoomDialog';
import { JoinRoomDialog } from './JoinRoomDialog';

export function RoomsList() {
  const navigate = useNavigate();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false);
  const [isJoinDialogOpen, setIsJoinDialogOpen] = React.useState(false);

  const handleCreateRoom = (data: { name: string; videoUrl: string }) => {
    // In a real app, you'd create the room on the backend first
    const roomId = Date.now().toString(); // Temporary ID generation
    navigate(`/rooms/${roomId}`, { 
      state: { 
        name: data.name,
        videoUrl: data.videoUrl 
      }
    });
  };

  const handleJoinRoom = (roomId: string) => {
    navigate(`/rooms/${roomId}`);
  };

  return (
    <div>
      <div className="flex gap-4 mb-6">
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Room
        </Button>
        <Button variant="secondary" onClick={() => setIsJoinDialogOpen(true)}>
          <UserPlus className="w-4 h-4 mr-2" />
          Join Room
        </Button>
      </div>

      <CreateRoomDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSubmit={handleCreateRoom}
      />
      
      <JoinRoomDialog
        isOpen={isJoinDialogOpen}
        onClose={() => setIsJoinDialogOpen(false)}
        onSubmit={handleJoinRoom}
      />
    </div>
  );
}