import React, { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { DropdownMenu } from '../ui/dropdown-menu';
import { NotificationItem } from './NotificationItem';
import { doc, onSnapshot, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

interface FriendRequest {
  uid: string;
  displayName: string;
  status: string;
  timestamp: any;
  photoURL?: string;
}

interface UserData {
  displayName: string;
  photoURL?: string;
  friendRequests?: FriendRequest[];
  friends?: any[];
}

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser?.uid) return;

    const userRef = doc(db, 'users', currentUser.uid);
    const unsubscribe = onSnapshot(userRef, async (docSnapshot) => {
      if (docSnapshot.exists()) {
        const data = docSnapshot.data();
        const requests = data.friendRequests || [];
        
        const updatedRequests = await Promise.all(
          requests.map(async (request: FriendRequest) => {
            try {
              const senderRef = doc(db, 'users', request.uid);
              const senderDoc = await getDoc(senderRef);
              
              if (senderDoc.exists()) {
                const senderData = senderDoc.data() as UserData;
                return {
                  ...request,
                  displayName: senderData.displayName || 'Anonymous',
                  photoURL: senderData.photoURL || ''
                };
              }
              return request;
            } catch (error) {
              console.error('Error fetching user details:', error);
              return request;
            }
          })
        );

        setFriendRequests(updatedRequests);
      }
    });

    return () => unsubscribe();
  }, [currentUser]);

  const handleAcceptFriendRequest = async (request: FriendRequest) => {
    if (!currentUser?.uid) return;

    try {
      const userRef = doc(db, 'users', currentUser.uid);
      const senderRef = doc(db, 'users', request.uid);

      const userDoc = await getDoc(userRef);
      if (!userDoc.exists()) return;

      const userData = userDoc.data() as UserData;
      
      // Filter out the accepted request and update friends list
      const updatedRequests = userData.friendRequests?.filter(
        req => req.uid !== request.uid
      ) || [];

      const updatedFriends = [
        ...(userData.friends || []),
        {
          uid: request.uid,
          displayName: request.displayName,
          photoURL: request.photoURL
        }
      ];

      // Update current user's document
      await updateDoc(userRef, {
        friendRequests: updatedRequests,
        friends: updatedFriends
      });

      // Update sender's friends list
      const senderDoc = await getDoc(senderRef);
      if (senderDoc.exists()) {
        const senderData = senderDoc.data() as UserData;
        await updateDoc(senderRef, {
          friends: [
            ...(senderData.friends || []),
            {
              uid: currentUser.uid,
              displayName: currentUser.displayName || 'Anonymous',
              photoURL: currentUser.photoURL || ''
            }
          ]
        });
      }

    } catch (error) {
      console.error('Error accepting friend request:', error);
    }
  };

  const handleDeclineFriendRequest = async (request: FriendRequest) => {
    if (!currentUser?.uid) return;

    try {
      const userRef = doc(db, 'users', currentUser.uid);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) return;

      const userData = userDoc.data() as UserData;
      
      // Filter out the declined request
      const updatedRequests = userData.friendRequests?.filter(
        req => req.uid !== request.uid
      ) || [];

      // Update the document
      await updateDoc(userRef, {
        friendRequests: updatedRequests
      });

    } catch (error) {
      console.error('Error declining friend request:', error);
    }
  };

  return (
    <div className="relative">
      <button 
        className="p-2 hover:bg-netflix-gray rounded-lg relative"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="w-6 h-6 text-gray-400" />
        {friendRequests.length > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-netflix-red rounded-full" />
        )}
      </button>
      
      <DropdownMenu isOpen={isOpen} onClose={() => setIsOpen(false)} className="w-80">
        <div className="px-4 py-2">
          <h3 className="font-semibold text-white">Notifications</h3>
        </div>
        <div className="max-h-[400px] overflow-y-auto">
          {friendRequests.length > 0 ? (
            friendRequests.map((request) => (
              <NotificationItem 
                key={request.uid}
                title="Friend Request"
                message={`${request.displayName} wants to be your friend`}
                time={new Date(request.timestamp?.toDate()).toLocaleTimeString()}
                type="friend"
                user={{ 
                  name: request.displayName,
                  image: request.photoURL || '' 
                }}
                isRead={false}
                onAccept={() => handleAcceptFriendRequest(request)}
                onDecline={() => handleDeclineFriendRequest(request)}
              />
            ))
          ) : (
            <div className="px-4 py-3 text-sm text-gray-400">
              No new notifications
            </div>
          )}
        </div>
      </DropdownMenu>
    </div>
  );
}