import { useNavigate } from 'react-router-dom';
import {CreateRoomCard} from './CreateRoomDialog';
import {JoinRoomCard} from './JoinRoomDialog';

export function RoomsList() {
  const navigate = useNavigate();

  const handleCreateRoom = (data: { name: string; videoUrl: string; password?: string }) => {
    try {
      const roomId = Date.now().toString();
      navigate(`/rooms/${roomId}`, {
        state: {
          name: data.name,
          videoUrl: data.videoUrl,
          password: data.password,
        },
      });
    } catch (error) {
      console.error('Error creating room:', error);
    }
  };

  const handleJoinRoom = (data: { roomId: string; password?: string }) => {
    try {
      navigate(`/rooms/${data.roomId}`, {
        state: {
          password: data.password,
        },
      });
    } catch (error) {
      console.error('Error joining room:', error);
    }
  };

  return (
    <main className="grid md:grid-cols-2 gap-4 text-white">
      <CreateRoomCard onSubmit={handleCreateRoom} />
      <JoinRoomCard onSubmit={handleJoinRoom} />
    </main>
  );
}