import React, { useState, useEffect, useRef } from 'react';
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from '../ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { 
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
  getDoc,
  getFirestore,
  Timestamp
} from 'firebase/firestore';

interface User {
  uid: string;
  customUID: string;
  displayName: string | null;
  photoURL: string | null;
  email: string | null;
}

interface FriendRequest {
  senderId: string;
  recipientId: string;
  status: 'pending' | 'accepted' | 'rejected';
  timestamp: Timestamp;
}

const SearchComponent = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [friends, setFriends] = useState<string[]>([]); // Array of friend UIDs
  const [sendingRequest, setSendingRequest] = useState(false);
  const [pendingRequests, setPendingRequests] = useState<string[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { currentUser } = useAuth();
  const db = getFirestore();

  useEffect(() => {
    const fetchFriendsAndRequests = async () => {
      if (!currentUser?.uid) return;
      
      try {
        // Fetch current user's friends list
        const userRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          console.log('User data:', userData); // Debugging: Log user data

          // Ensure the friends array contains UIDs
          const friendsArray = userData.friends || [];
          const friendUids = friendsArray.map((friend: any) => friend.uid); // Extract UIDs
          setFriends(friendUids);
        }

        // Fetch pending requests
        const requestsRef = collection(db, 'friendRequests');
        const q = query(
          requestsRef, 
          where('senderId', '==', currentUser.uid),
          where('status', '==', 'pending')
        );
        const querySnapshot = await getDocs(q);
        const pendingRequestIds = querySnapshot.docs.map(doc => doc.data().recipientId);
        setPendingRequests(pendingRequestIds);
      } catch (error) {
        console.error('Error fetching friends and requests:', error);
      }
    };

    fetchFriendsAndRequests();
  }, [currentUser]);

  useEffect(() => {
    const searchUsers = async () => {
      if (searchQuery.length < 1) {
        setFilteredUsers([]);
        return;
      }

      setLoading(true);
      try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('customUID', '==', searchQuery));
        
        const querySnapshot = await getDocs(q);
        const users: User[] = [];
        
        querySnapshot.forEach((doc) => {
          if (doc.id !== currentUser?.uid) {
            users.push({
              uid: doc.id,
              ...doc.data()
            } as User);
          }
        });

        setFilteredUsers(users);
      } catch (error) {
        console.error('Error searching users:', error);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(searchUsers, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, currentUser]);

  const handleAddFriend = async (targetUser: User) => {
    if (!currentUser?.uid) {
      alert('You must be logged in to send friend requests');
      return;
    }

    setSendingRequest(true);
    try {
      // Create a new friend request document
      const requestId = `${currentUser.uid}_${targetUser.uid}`;
      const requestRef = doc(db, 'friendRequests', requestId);
      
      // Check if request already exists
      const existingRequest = await getDoc(requestRef);
      if (existingRequest.exists()) {
        alert('Friend request already sent');
        setSendingRequest(false);
        return;
      }

      
      const friendRequest: FriendRequest = {
        senderId: currentUser.uid,
        recipientId: targetUser.uid,
        status: 'pending',
        timestamp: Timestamp.now()
      };

      await setDoc(requestRef, friendRequest);
      
      setPendingRequests(prev => [...prev, targetUser.uid]);
      alert('Friend request sent successfully!');
    } catch (error) {
      console.error('Error sending friend request:', error);
      alert('Failed to send friend request. Please try again.');
    } finally {
      setSendingRequest(false);
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleInputFocus = () => {
    setShowDropdown(true);
  };

  const handleInputBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    if (!dropdownRef.current?.contains(event.relatedTarget as Node)) {
      setShowDropdown(false);
    }
  };

  const getButtonState = (userId: string) => {
    if (friends.includes(userId)) {
      return { text: 'Friends', disabled: true, isFriend: true };
    }
    if (pendingRequests.includes(userId)) {
      return { text: 'Request Sent', disabled: true, isFriend: false };
    }
    return { text: 'Add friend', disabled: false, isFriend: false };
  };

  return (
    <div className="relative w-80">
      <Input
        type="text"
        placeholder="Enter friend code (e.g., 634263)"
        value={searchQuery}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        className="w-full dark:bg-gray-950 dark:border-gray-800 text-black dark:text-gray-200 dark:placeholder:text-gray-500 focus-visible:ring-gray-700"
      />
      {showDropdown && (
        <div ref={dropdownRef} className="absolute w-full z-50 mt-1">
          <Card className="border-gray-800 dark:bg-gray-950">
            <CardContent className="p-0">
              {loading ? (
                <div className="p-3 text-sm text-gray-400">
                  Searching...
                </div>
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((user) => {
                  const buttonState = getButtonState(user.uid);

                  return (
                    <div
                      key={user.uid}
                      className="flex items-center gap-2 p-3 cursor-pointer dark:hover:bg-gray-900 transition-colors border-b dark:border-gray-800 last:border-b-0"
                    >
                      <Avatar>
                        <AvatarImage
                          src={user.photoURL || undefined}
                          alt={`${user.displayName} profile picture`}
                        />
                        <AvatarFallback className="dark:bg-gray-800 dark:text-gray-200">
                          {user.displayName?.split(' ').map(n => n[0]).join('') || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-medium dark:text-gray-200">
                          {user.displayName || 'Anonymous'}
                        </span>
                        <span className="text-sm dark:text-gray-400">
                          #{user.customUID}
                        </span>
                      </div>
                      <div className="ml-auto">
                        {buttonState.isFriend ? (
                          <span className="text-sm text-gray-400">Friends</span>
                        ) : (
                          <Button 
                            variant="secondary"
                            className="text-sm"
                            onClick={() => handleAddFriend(user)}
                            disabled={buttonState.disabled || sendingRequest}
                          >
                            {sendingRequest && !buttonState.disabled ? 'Sending...' : buttonState.text}
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : searchQuery.length > 0 ? (
                <div className="p-3 text-sm text-gray-400">
                  No user found with this friend code
                </div>
              ) : (
                <div className="p-3 text-sm text-gray-400">
                  Enter a friend code to search
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default SearchComponent;