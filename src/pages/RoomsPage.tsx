import { MainLayout } from '../components/layout/MainLayout';
import { RoomsList } from '../components/rooms/RoomsList';

export function RoomsPage() {
  return (
    <MainLayout>
      <RoomsList />
    </MainLayout>
  );
}