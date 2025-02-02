import { useState, useEffect } from 'react';
import {  Search, UserMinus, MessageCircle } from 'lucide-react';
import { doc, getDoc, getFirestore } from 'firebase/firestore';
import { useAuth } from '@/hooks/use-auth'; 
import { MainLayout } from '../layout/MainLayout';

interface Friend {
  id: string;
  name: string;
  photoURL: string | null;
  status: 'online' | 'offline';
  lastSeen?: string;
}


export default function FriendsList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [friends, setFriends] = useState<Friend[]>([]);
  const { currentUser } = useAuth();
  const db = getFirestore();

  useEffect(() => {
    const fetchFriends = async () => {
      if (!currentUser?.uid) return;

      try {
        const userRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          const friendsArray = userData.friends || [];

          const mappedFriends = await Promise.all(
            friendsArray.map(async (friend: any) => {
              const friendRef = doc(db, 'users', friend.uid);
              const friendDoc = await getDoc(friendRef);

              if (friendDoc.exists()) {
                const friendData = friendDoc.data();
                return {
                  id: friend.uid,
                  name: friendData.displayName || 'Anonymous',
                  photoURL: friendData.photoURL || null,
                  status: friendData.isOnline ? 'online' : 'offline',
                  lastSeen: friendData.lastSeen
                    ? new Date(friendData.lastSeen.toDate()).toLocaleTimeString()
                    : undefined,
                };
              }
              return null;
            })
          );
          setFriends(mappedFriends.filter((friend) => friend !== null) as Friend[]);
        }
      } catch (error) {
        console.error('Error fetching friends:', error);
      }
    };

    fetchFriends();
  }, [currentUser]);

  const filteredFriends = friends.filter((friend) =>
    friend.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <MainLayout>
    <div className="container mx-auto py-10 px-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Friends</h1>
      </div>
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search friends..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-netflix-hover text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-netflix-red"
        />
      </div>
      <div className="space-y-4">
        {filteredFriends.map((friend) => (
          <div key={friend.id} className="flex items-center space-x-4 p-4 bg-netflix-gray rounded-lg">
            <div className="w-10 h-10 rounded-full bg-gray-500">
              {friend.photoURL && (
                <img
                  src={friend.photoURL}
                  alt={friend.name}
                  className="w-full h-full rounded-full object-cover"
                />
              )}
            </div>
            <div className="flex-1">
              <div className="text-white font-semibold">{friend.name}</div>
              <div className="text-sm text-gray-400">
                {friend.status === 'online' ? 'Online' : `Last seen ${friend.lastSeen}`}
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-netflix-hover transition-colors"
                title="Message friend"
              >
                <MessageCircle className="w-4 h-4" />
              </button>
              <button
                className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-netflix-hover transition-colors"
                title="Remove friend"
              >
                <UserMinus className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
    </MainLayout>
  );
}
