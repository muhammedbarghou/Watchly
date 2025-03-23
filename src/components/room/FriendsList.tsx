import React, { useState, useEffect } from 'react';
import { 
  collection, 
  getDocs, 
  addDoc, 
  serverTimestamp, 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { UserPlus, Search, Check, X, Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardFooter 
} from '@/components/ui/card';
import { toast } from 'sonner';

interface Friend {
  id: string;
  displayName: string;
  photoURL?: string;
  status?: 'online' | 'offline' | 'away';
  lastActive?: any; // Firebase timestamp
}

interface RoomParticipant {
  id: string;
  displayName: string;
  photoURL?: string;
  isHost: boolean;
}

interface FriendsListProps {
  userId: string;
  roomId: string;
  documentId: string;
  isHost: boolean;
  participants: RoomParticipant[];
  onInviteSent?: () => void;
}

const FriendsList: React.FC<FriendsListProps> = ({
  userId,
  roomId,
  documentId,
  isHost,
  participants,
  onInviteSent
}) => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [filteredFriends, setFilteredFriends] = useState<Friend[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [invitingSent, setInvitingSent] = useState<boolean>(false);

  useEffect(() => {
    const fetchFriends = async () => {
      if (!userId) return;
      
      setLoading(true);
      
      try {
        const friendsRef = collection(db, 'users', userId, 'friends');
        const querySnapshot = await getDocs(friendsRef);
        
        const friendsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Friend[];
        
        // Sort by online status and then by display name
        const sortedFriends = friendsData.sort((a, b) => {
          // First sort by online status
          if (a.status === 'online' && b.status !== 'online') return -1;
          if (a.status !== 'online' && b.status === 'online') return 1;
          
          // Then sort by display name
          return a.displayName.localeCompare(b.displayName);
        });
        
        setFriends(sortedFriends);
        setFilteredFriends(sortedFriends);
      } catch (error) {
        console.error('Error fetching friends:', error);
        toast.error('Failed to load friends list');
      } finally {
        setLoading(false);
      }
    };
    
    fetchFriends();
  }, [userId]);

  // Filter friends when search query changes
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredFriends(friends);
    } else {
      const lowercaseQuery = searchQuery.toLowerCase();
      const filtered = friends.filter(friend => 
        friend.displayName.toLowerCase().includes(lowercaseQuery)
      );
      setFilteredFriends(filtered);
    }
  }, [searchQuery, friends]);

  // Toggle friend selection for invitation
  const toggleFriendSelection = (friendId: string) => {
    if (selectedFriends.includes(friendId)) {
      setSelectedFriends(selectedFriends.filter(id => id !== friendId));
    } else {
      setSelectedFriends([...selectedFriends, friendId]);
    }
  };

  // Send invitations to selected friends
  const sendInvitations = async () => {
    if (!isHost || selectedFriends.length === 0) return;
    
    setInvitingSent(true);
    
    try {
      const invitationPromises = selectedFriends.map(async (friendId) => {
        const friend = friends.find(f => f.id === friendId);
        if (!friend) return null;
        
        // Create invitation in the friend's notifications collection
        return addDoc(collection(db, 'users', friendId, 'notifications'), {
          type: 'room_invitation',
          roomId,
          documentId,
          senderId: userId,
          senderName: participants.find(p => p.id === userId)?.displayName || 'Someone',
          message: `You've been invited to join a watch room`,
          timestamp: serverTimestamp(),
          read: false
        });
      });
      
      await Promise.all(invitationPromises);
      
      toast.success(`Invitation${selectedFriends.length > 1 ? 's' : ''} sent!`);
      setSelectedFriends([]);
      
      if (onInviteSent) {
        onInviteSent();
      }
    } catch (error) {
      console.error('Error sending invitations:', error);
      toast.error('Failed to send invitations');
    } finally {
      setInvitingSent(false);
    }
  };

  // Clear all selected friends
  const clearSelection = () => {
    setSelectedFriends([]);
  };

  // Get status badge color based on friend status
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'offline': 
      default: return 'bg-gray-400';
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg">Friends</CardTitle>
        <CardDescription>
          {isHost 
            ? 'Select friends to invite to the room' 
            : 'Your friends list'
          }
        </CardDescription>
        
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search friends..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredFriends.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-6 h-40">
            <p className="text-sm text-muted-foreground">No friends found</p>
            {searchQuery && (
              <Button 
                variant="link" 
                className="mt-2 h-auto p-0" 
                onClick={() => setSearchQuery('')}
              >
                Clear search
              </Button>
            )}
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="px-4 py-2 space-y-2">
              {filteredFriends.map(friend => {
                const isInRoom = participants.some(p => p.id === friend.id);
                const isSelected = selectedFriends.includes(friend.id);
                
                return (
                  <div 
                    key={friend.id}
                    className={`
                      flex items-center justify-between p-2 rounded-md border
                      ${isSelected ? 'bg-primary/10 border-primary' : 'border-transparent'}
                      ${isHost && !isInRoom ? 'cursor-pointer hover:bg-secondary/50' : ''}
                    `}
                    onClick={() => {
                      if (isHost && !isInRoom) {
                        toggleFriendSelection(friend.id);
                      }
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="h-10 w-10">
                          {friend.photoURL ? (
                            <AvatarImage src={friend.photoURL} alt={friend.displayName} />
                          ) : (
                            <AvatarFallback>{friend.displayName.charAt(0)}</AvatarFallback>
                          )}
                        </Avatar>
                        <span 
                          className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background ${getStatusColor(friend.status)}`}
                          aria-hidden="true"
                        />
                      </div>
                      
                      <div className="flex flex-col">
                        <span className="font-medium">{friend.displayName}</span>
                        <span className="text-xs text-muted-foreground">
                          {friend.status || 'offline'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      {isInRoom ? (
                        <Badge variant="outline">In Room</Badge>
                      ) : isSelected ? (
                        <Check className="h-5 w-5 text-primary" />
                      ) : isHost ? (
                        <UserPlus className="h-4 w-4 text-muted-foreground" />
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
      
      {isHost && selectedFriends.length > 0 && (
        <CardFooter className="flex justify-between border-t p-4">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8" 
              onClick={clearSelection}
            >
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
            <span className="text-sm">
              {selectedFriends.length} {selectedFriends.length === 1 ? 'friend' : 'friends'} selected
            </span>
          </div>
          <Button 
            size="sm" 
            className="h-8" 
            onClick={sendInvitations}
            disabled={invitingSent}
          >
            {invitingSent ? (
              <>
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4 mr-1" />
                Invite
              </>
            )}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default FriendsList;