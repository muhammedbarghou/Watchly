import React from 'react';
import { MainLayout } from '../components/layout/MainLayout';
import { FriendsList } from '../components/friends/FriendsList';

export function FriendsPage() {
  return (
    <MainLayout>
      <div>
        <h1 className="text-2xl font-bold mb-6">Friends</h1>
        <FriendsList />
      </div>
    </MainLayout>
  );
}