import  { useState, useEffect } from 'react';
import { Search, User, UserPlus, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useFriends } from '@/hooks/use-friends';

interface FriendSearchProps {
  onSearchComplete?: () => void;
}

export function FriendSearch({ onSearchComplete }: FriendSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [pendingSends, setPendingSends] = useState<Record<string, boolean>>({});
  
  const { 
    friends, 
    outgoingRequests, 
    searchUsersByCode, 
    sendFriendRequest 
  } = useFriends();
  
  // Handle search
  useEffect(() => {
    const performSearch = async () => {
      if (searchQuery.length < 3) {
        setSearchResults([]);
        return;
      }
      
      setLoading(true);
      const results = await searchUsersByCode(searchQuery);
      setSearchResults(results);
      setLoading(false);
    };
    
    const timer = setTimeout(performSearch, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, searchUsersByCode]);
  
  // Check if user is already a friend or has pending request
  const getUserStatus = (userId: string) => {
    if (friends.find(friend => friend.id === userId)) {
      return 'friend';
    }
    
    if (outgoingRequests.find(request => request.recipientId === userId)) {
      return 'pending';
    }
    
    return 'none';
  };
  
  // Handle friend request
  const handleSendRequest = async (userId: string) => {
    setPendingSends(prev => ({ ...prev, [userId]: true }));
    await sendFriendRequest(userId);
    setPendingSends(prev => ({ ...prev, [userId]: false }));
    
    if (onSearchComplete) {
      onSearchComplete();
    }
  };
  
  return (
    <div className="w-full space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search by friend code (e.g. 123456)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>
      
      {loading && (
        <div className="flex justify-center p-4">
          <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
        </div>
      )}
      
      {!loading && searchResults.length > 0 && (
        <Card>
          <CardContent className="p-0">
            {searchResults.map(user => {
              const status = getUserStatus(user.id);
              
              return (
                <div 
                  key={user.id} 
                  className="p-4 border-b last:border-0 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage 
                        src={user.photoURL || undefined} 
                        alt={user.displayName} 
                      />
                      <AvatarFallback>
                        {user.displayName?.charAt(0) || <User className="w-4 h-4" />}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div>
                      <h3 className="font-medium">{user.displayName || 'Anonymous'}</h3>
                      <p className="text-sm text-gray-500">#{user.customUID}</p>
                    </div>
                  </div>
                  
                  {status === 'friend' ? (
                    <Button variant="ghost" disabled>
                      <Check className="mr-2 h-4 w-4" />
                      Friends
                    </Button>
                  ) : status === 'pending' ? (
                    <Button variant="outline" disabled>
                      Request Sent
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleSendRequest(user.id)}
                      disabled={pendingSends[user.id]}
                    >
                      {pendingSends[user.id] ? (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent mr-2" />
                      ) : (
                        <UserPlus className="mr-2 h-4 w-4" />
                      )}
                      Add Friend
                    </Button>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
      
      {!loading && searchQuery.length >= 3 && searchResults.length === 0 && (
        <div className="text-center p-4 text-gray-500">
          No users found with that friend code.
        </div>
      )}
    </div>
  );
}