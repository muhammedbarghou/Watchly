import { MainLayout } from '../components/layout/MainLayout';
import {Steps} from '../components/friends/Steps';

export function Hub() {
  return (
    <MainLayout>
      <div className='p-5 h-screen'>
          <h1 className='text-2xl font-bold mb-6'>Welcome to the Main hub</h1>
          <Steps />
      </div>
    </MainLayout>
  );
}