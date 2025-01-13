import { MainLayout } from '../components/layout/MainLayout';
import { RoomsList } from '../components/rooms/RoomsList';

export function RoomsPage() {
  return (
    <MainLayout>
      <div>
        <h1 className="text-2xl font-bold mb-6">Video Rooms</h1>
        <RoomsList />
      </div>
    </MainLayout>
  );
}