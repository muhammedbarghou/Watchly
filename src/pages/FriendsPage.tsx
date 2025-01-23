import { MainLayout } from '../components/layout/MainLayout';
import { FriendsList } from '../components/friends/FriendsList';
import {Steps} from '../components/friends/Steps';

export function FriendsPage() {
  return (
    <MainLayout>
      <div className='grid grid-cols-1 md:grid-cols-3 p-5'>
        <aside className='col-span-1 md:col-span-2'>
          <h1 className='text-2xl font-bold mb-6'>How to set Your room</h1>
          <Steps />
        </aside>
        <article className='col-span-1'>
          <FriendsList />
        </article>
      </div>
    </MainLayout>
  );
}