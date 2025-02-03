import React, { useState, useEffect, useRef } from 'react';
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
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

interface UserCardProps {
  user: User;
  isFriend: boolean;
  isPending: boolean;
  onAddFriend: (user: User) => Promise<void>;
  isLoading: boolean;
}

const UserCard: React.FC<UserCardProps> = ({
  user,
  isFriend,
  isPending,
  onAddFriend,
  isLoading
}) => {
  const initials = user.displayName
    ?.split(' ')
    .map(n => n[0])
    .join('') || 'U';

  return (
    <div className="flex items-center gap-2 p-3 cursor-pointer dark:hover:bg-gray-900/50 hover:bg-gray-50 transition-colors border-b dark:border-gray-800 last:border-b-0">
      <Avatar>
        <AvatarImage
          src={user.photoURL || undefined}
          alt={`${user.displayName} profile picture`}
        />
        <AvatarFallback className="dark:bg-gray-800 dark:text-gray-200">
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col min-w-0">
        <span className="font-medium dark:text-gray-200 truncate">
          {user.displayName || 'Anonymous'}
        </span>
        <span className="text-sm dark:text-gray-400">
          #{user.customUID}
        </span>
      </div>
      <div className="ml-auto">
        {isFriend ? (
          <span className="text-sm text-gray-400">Friends</span>
        ) : (
          <Button 
            variant="secondary"
            size="sm"
            className="text-sm whitespace-nowrap"
            onClick={() => onAddFriend(user)}
            disabled={isPending || isLoading}
          >
            {isLoading ? 'Sending...' : isPending ? 'Request Sent' : 'Add friend'}
          </Button>
        )}
      </div>
    </div>
  );
};

const SearchDropdown: React.FC<{
  loading: boolean;
  users: User[];
  searchQuery: string;
  onAddFriend: (user: User) => Promise<void>;
  friends: string[];
  pendingRequests: string[];
  sendingRequest: boolean;
}> = ({
  loading,
  users,
  searchQuery,
  onAddFriend,
  friends,
  pendingRequests,
  sendingRequest
}) => {
  if (loading) {
    return <div className="p-3 text-sm text-gray-400">Searching...</div>;
  }

  if (users.length > 0) {
    return (
      <>
        {users.map((user) => (
          <UserCard
            key={user.uid}
            user={user}
            isFriend={friends.includes(user.uid)}
            isPending={pendingRequests.includes(user.uid)}
            onAddFriend={onAddFriend}
            isLoading={sendingRequest}
          />
        ))}
      </>
    );
  }

  if (searchQuery.length > 0) {
    return (
      <div className="p-3 text-sm text-gray-400">
        No user found with this friend code
      </div>
    );
  }

  return (
    <div className="p-3 text-sm text-gray-400">
      Enter a friend code to search
    </div>
  );
};

const SearchComponent = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [friends, setFriends] = useState<string[]>([]);
  const [sendingRequest, setSendingRequest] = useState(false);
  const [pendingRequests, setPendingRequests] = useState<string[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const { currentUser } = useAuth();
  const db = getFirestore();

  useEffect(() => {
    const fetchFriendsAndRequests = async () => {
      if (!currentUser?.uid) return;
      
      try {
        const userRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const friendsArray = userData.friends || [];
          const friendUids = Array.isArray(friendsArray) 
            ? friendsArray.map((friend: any) => friend.uid)
            : [];
          setFriends(friendUids);
        }

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

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(searchUsers, 300);
    
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, currentUser]);

  const handleAddFriend = async (targetUser: User) => {
    if (!currentUser?.uid) {
      return;
    }

    setSendingRequest(true);
    try {
      const requestId = `${currentUser.uid}_${targetUser.uid}`;
      const requestRef = doc(db, 'friendRequests', requestId);
      
      const existingRequest = await getDoc(requestRef);
      if (existingRequest.exists()) {
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
    } catch (error) {
      console.error('Error sending friend request:', error);
    } finally {
      setSendingRequest(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-80">
      <Input
        type="text"
        placeholder="Enter friend code (e.g., 634263)"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onFocus={() => setShowDropdown(true)}
        className="w-full dark:bg-gray-950 dark:border-gray-800 text-black dark:text-gray-200 dark:placeholder:text-gray-500 focus-visible:ring-gray-700"
      />
      {showDropdown && (
        <div 
          ref={dropdownRef} 
          className="absolute w-full z-50 mt-1 shadow-lg rounded-md overflow-hidden"
        >
          <Card className="border-gray-800 dark:bg-gray-950">
            <CardContent className="p-0">
              <SearchDropdown
                loading={loading}
                users={filteredUsers}
                searchQuery={searchQuery}
                onAddFriend={handleAddFriend}
                friends={friends}
                pendingRequests={pendingRequests}
                sendingRequest={sendingRequest}
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default SearchComponent;