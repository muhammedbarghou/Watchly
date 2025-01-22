import { useNavigate } from 'react-router-dom';
import { CreateRoomCard } from './CreateRoomDialog';
import { JoinRoomCard } from './JoinRoomDialog';
import { createRoomAsync, joinRoomAsync, leaveRoomAsync } from '@/slices/roomSlice';
import { useAppDispatch, useAppSelector } from '@/hooks/use-room'; // Import the custom hooks

export function RoomsList() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { loading, error } = useAppSelector((state) => state.room);

  const handleCreateRoom = async (data: { name: string; videoUrl: string; password?: string }) => {
    try {
      const resultAction = await dispatch(
        createRoomAsync({
          ...data,
          createdBy: 'user123', // Replace with the actual user ID from your auth system
        })
      ).unwrap();

      // Navigate to the newly created room
      if (resultAction) {
        navigate(`/rooms/${resultAction.id}`);
      }
    } catch (error) {
      console.error('Failed to create room:', error);
    }
  };

  const handleJoinRoom = async (data: { roomId: string; password?: string }) => {
    try {
      const resultAction = await dispatch(
        joinRoomAsync({
          roomId: data.roomId,
          userId: 'user123', // Replace with the actual user ID from your auth system
        })
      ).unwrap();

      if (resultAction) {
        navigate(`/rooms/${resultAction.id}`);
      }
    } catch (error) {
      console.error('Failed to join room:', error);
    }
  };

  // Handle leaving a room
  const handleLeaveRoom = async (roomId: string) => {
    try {
      await dispatch(
        leaveRoomAsync({
          roomId,
          userId: 'user123', // Replace with the actual user ID from your auth system
        })
      ).unwrap();

      // Navigate back to the home page
      navigate('/');
    } catch (error) {
      console.error('Failed to leave room:', error);
    }
  };

  return (
    <main className="grid md:grid-cols-2 gap-4 text-white">
      
      <CreateRoomCard
        onSubmit={handleCreateRoom}
        loading={loading}
        error={error}
      />

      {/* Join Room Card */}
      <JoinRoomCard
        onSubmit={handleJoinRoom}
        loading={loading}
        error={error}
      />
    </main>
  );
}