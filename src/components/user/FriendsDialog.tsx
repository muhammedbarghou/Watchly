import { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Search, UserMinus, MessageCircle } from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, getFirestore } from 'firebase/firestore';
import { useAuth } from '@/hooks/use-auth'; 

interface Friend {
  id: string;
  name: string;
  photoURL: string | null;
  status: 'online' | 'offline';
  lastSeen?: string;
}

interface FriendsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  user: FirebaseUser & { friends: { uid: string }[] };
}

export function FriendsDialog({ isOpen, onOpenChange }: FriendsDialogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [friends, setFriends] = useState<Friend[]>([]);
  const { currentUser } = useAuth(); // Get the current user from AuthContext
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

          // Map the friends array to the Friend interface
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

          // Filter out null values and set the friends state
          setFriends(mappedFriends.filter((friend) => friend !== null) as Friend[]);
        }
      } catch (error) {
        console.error('Error fetching friends:', error);
      }
    };

    fetchFriends();
  }, [currentUser, isOpen]); // Fetch friends when the dialog is opened or the current user changes

  const filteredFriends = friends.filter((friend) =>
    friend.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-netflix-gray rounded-xl shadow-xl">
          <div className="p-6">
            <Dialog.Title className="text-xl font-bold text-white mb-4">
              Friends
            </Dialog.Title>

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
                <div key={friend.id} className="flex items-center space-x-4">
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

          <Dialog.Close asChild>
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}