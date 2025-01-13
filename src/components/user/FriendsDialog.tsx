import  { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Search, UserPlus, UserMinus, MessageCircle } from 'lucide-react';

import { User as FirebaseUser } from 'firebase/auth';

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
  user: FirebaseUser | null;
}

export function FriendsDialog({ isOpen, onOpenChange,  }: FriendsDialogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'friends' | 'requests'>('friends');
  
  // Mock data - replace with actual Firebase data fetching
  const [friends] = useState<Friend[]>([
    { id: '1', name: 'Sarah Johnson', photoURL: null, status: 'online' },
    { id: '2', name: 'Mike Peters', photoURL: null, status: 'offline', lastSeen: '2 hours ago' },
    { id: '3', name: 'Emma Wilson', photoURL: null, status: 'online' },
  ]);

  const [friendRequests] = useState([
    { id: '4', name: 'John Smith', photoURL: null },
    { id: '5', name: 'Alice Brown', photoURL: null },
  ]);

  const filteredFriends = friends.filter(friend =>
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

            <div className="flex gap-4 mb-4">
              <button
                onClick={() => setActiveTab('friends')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'friends'
                    ? 'bg-netflix-red text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Friends ({friends.length})
              </button>
              <button
                onClick={() => setActiveTab('requests')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'requests'
                    ? 'bg-netflix-red text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Requests ({friendRequests.length})
              </button>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {activeTab === 'friends' ? (
                filteredFriends.map((friend) => (
                  <div
                    key={friend.id}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-netflix-hover transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-netflix-hover flex items-center justify-center">
                          {friend.photoURL ? (
                            <img
                              src={friend.photoURL}
                              alt={friend.name}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-gray-400 text-sm">
                              {friend.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          )}
                        </div>
                        <div
                          className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-netflix-gray ${
                            friend.status === 'online' ? 'bg-green-500' : 'bg-gray-500'
                          }`}
                        />
                      </div>
                      <div>
                        <p className="text-white font-medium">{friend.name}</p>
                        <p className="text-sm text-gray-400">
                          {friend.status === 'online'
                            ? 'Online'
                            : `Last seen ${friend.lastSeen}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-netflix-hover transition-colors"
                        title="Send message"
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
                ))
              ) : (
                friendRequests.map((request) => (
                  <div
                    key={request.id}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-netflix-hover transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-netflix-hover flex items-center justify-center">
                        {request.photoURL ? (
                          <img
                            src={request.photoURL}
                            alt={request.name}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-gray-400 text-sm">
                            {request.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        )}
                      </div>
                      <p className="text-white font-medium">{request.name}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        className="p-2 text-green-500 hover:bg-netflix-hover rounded-lg transition-colors"
                        title="Accept request"
                      >
                        <UserPlus className="w-4 h-4" />
                      </button>
                      <button
                        className="p-2 text-red-500 hover:bg-netflix-hover rounded-lg transition-colors"
                        title="Reject request"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
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