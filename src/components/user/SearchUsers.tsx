import React, { useState, useEffect, useRef } from 'react';
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from '../ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { 
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  arrayUnion,
  getDoc,
  getFirestore
} from 'firebase/firestore';

interface User {
  uid: string;
  customUID: string;
  displayName: string | null;
  photoURL: string | null;
  email: string | null;
}

const SearchComponent = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [friendsList, setFriendsList] = useState<string[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { currentUser, userProfile } = useAuth();
  const db = getFirestore();

  
  useEffect(() => {
    const fetchFriendsList = async () => {
      if (currentUser) {
        const userRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          setFriendsList(userDoc.data().friends || []);
        }
      }
    };

    fetchFriendsList();
  }, [currentUser]);

  // Search users
  useEffect(() => {
    const searchUsers = async () => {
      if (searchQuery.length < 1) {
        setFilteredUsers([]);
        return;
      }

      setLoading(true);
      try {
        const usersRef = collection(db, 'userSearch');
        const searchTerms = searchQuery.toLowerCase();
        const q = query(usersRef, where('searchTerms', 'array-contains', searchTerms));
        
        const querySnapshot = await getDocs(q);
        const users: User[] = [];
        
        querySnapshot.forEach((doc) => {
          // Don't include current user in results
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
    if (!currentUser) return;

    try {
      // Add to current user's friend requests
      const userRef = doc(db, 'users', targetUser.uid);
      await updateDoc(userRef, {
        friendRequests: arrayUnion(currentUser.uid)
      });

      // Optional: Show some feedback
      alert('Friend request sent!');
    } catch (error) {
      console.error('Error sending friend request:', error);
      alert('Failed to send friend request');
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

  return (
    <div className="relative w-64">
      <Input
        type="text"
        placeholder="Search users by name..."
        value={searchQuery}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        className="w-full dark:bg-gray-950 dark:border-gray-800 text-black dark:text-gray-200 dark:placeholder:text-gray-500 focus-visible:ring-gray-700"
      />
      {showDropdown && (
        <div ref={dropdownRef} className="absolute w-full z-50 mt-1">
          <Card className="border-gray-800 dark:bg-gray-950">
            <ScrollArea className="h-60">
              <CardContent className="p-0">
                {loading ? (
                  <div className="p-3 text-sm text-gray-400">
                    Searching...
                  </div>
                ) : filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
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
                        {friendsList.includes(user.uid) ? (
                          <span className="text-gray-400 text-sm">Friends</span>
                        ) : (
                          <Button 
                            variant="secondary"
                            className="text-sm"
                            onClick={() => handleAddFriend(user)}
                          >
                            Add friend
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                ) : searchQuery.length > 0 ? (
                  <div className="p-3 text-sm text-gray-400">
                    No users found
                  </div>
                ) : (
                  <div className="p-3 text-sm text-gray-400">
                    Type to search users
                  </div>
                )}
              </CardContent>
            </ScrollArea>
          </Card>
        </div>
      )}
    </div>
  );
};

export default SearchComponent;