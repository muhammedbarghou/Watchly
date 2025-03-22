import React, { useState, useEffect } from 'react';
import { 
  collection, 
  deleteDoc, 
  doc,
  addDoc,
  getDoc,
  serverTimestamp,  
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { 
  UserPlus, 
  X, 
  Crown, 
  MoreVertical,
  UserMinus,
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface User {
  id: string;
  displayName: string;
  photoURL?: string;
  isHost: boolean;
  joinedAt: any; // Using 'any' here for simplicity, should be Timestamp
}

interface Friend {
  id: string;
  displayName: string;
  photoURL?: string;
  status?: 'online' | 'offline' | 'away';
}

interface ParticipantsPanelProps {
  roomId: string;
  documentId: string;
  isHost: boolean;
  currentUserId: string;
  participants: User[];
  onClose: () => void;
}

const ParticipantsPanel: React.FC<ParticipantsPanelProps> = ({
  roomId,
  documentId,
  isHost,
  currentUserId,
  participants,
  onClose
}) => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState<boolean>(false);
  const [searchValue, setSearchValue] = useState<string>('');
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);

  // Load friends list
  useEffect(() => {
    const loadFriends = async () => {
      if (!currentUserId) return;
      
      setLoading(true);
      try {
        // Get the user document which contains the friends array
        const userRef = doc(db, 'users', currentUserId);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          const friendsArray = userData.friends || [];

          // Fetch each friend's full data from their user document
          const mappedFriends = await Promise.all(
            friendsArray.map(async (friend: any) => {
              const friendRef = doc(db, 'users', friend.uid);
              const friendDoc = await getDoc(friendRef);

              if (friendDoc.exists()) {
                const friendData = friendDoc.data();
                return {
                  id: friend.uid,
                  displayName: friendData.displayName || 'Anonymous',
                  photoURL: friendData.photoURL || null,
                  status: friendData.isOnline ? 'online' : 'offline'
                };
              }
              return null;
            })
          );
          
          // Filter out any null values (friends that couldn't be fetched)
          setFriends(mappedFriends.filter((friend) => friend !== null) as Friend[]);
        }
      } catch (error) {
        console.error('Error loading friends:', error);
        toast.error('Failed to load friends list');
      } finally {
        setLoading(false);
      }
    };

    loadFriends();
  }, [currentUserId]);

  // Filter friends by search
  const filteredFriends = friends.filter(friend => 
    friend.displayName.toLowerCase().includes(searchValue.toLowerCase())
  );

  const handleKickUser = async (userId: string, displayName: string) => {
    if (!isHost || userId === currentUserId) return;
    
    try {
      // Remove user from the room
      const userRef = doc(db, 'rooms', documentId, 'users', userId);
      await deleteDoc(userRef);
      
      // Add system message
      await addDoc(collection(db, 'rooms', documentId, 'messages'), {
        text: `${displayName} was removed from the room by the host`,
        sender: 'system',
        senderDisplayName: 'System',
        timestamp: serverTimestamp(),
      });
      
      toast.success(`${displayName} was removed from the room`);
    } catch (error) {
      console.error('Error kicking user:', error);
      toast.error('Failed to remove user from the room');
    }
  };

  const handleInviteFriends = async () => {
    if (!isHost || selectedFriends.length === 0) return;
    
    try {
      // For each selected friend, create an invitation
      for (const friendId of selectedFriends) {
        const friend = friends.find(f => f.id === friendId);
        if (!friend) continue;
        
        // Create invitation in the friend's notifications
        await addDoc(collection(db, 'users', friendId, 'notifications'), {
          type: 'room_invitation',
          roomId: roomId,
          roomDocId: documentId,
          senderId: currentUserId,
          senderName: participants.find(p => p.id === currentUserId)?.displayName || 'A friend',
          createdAt: serverTimestamp(),
          read: false
        });
      }
      
      toast.success(`Invitation${selectedFriends.length > 1 ? 's' : ''} sent!`);
      setSelectedFriends([]);
      setInviteDialogOpen(false);
    } catch (error) {
      console.error('Error inviting friends:', error);
      toast.error('Failed to send invitations');
    }
  };

  const toggleFriendSelection = (friendId: string) => {
    if (selectedFriends.includes(friendId)) {
      setSelectedFriends(selectedFriends.filter(id => id !== friendId));
    } else {
      setSelectedFriends([...selectedFriends, friendId]);
    }
  };

  // Sort participants with host first
  const sortedParticipants = [...participants].sort((a, b) => {
    if (a.isHost && !b.isHost) return -1;
    if (!a.isHost && b.isHost) return 1;
    return 0;
  });

  return (
    <div className="w-full h-full flex flex-col border-r border-border bg-background">
      <div className="p-4 flex items-center justify-between border-b">
        <h2 className="font-medium text-lg flex items-center gap-2">
          Participants
          <Badge variant="secondary">{participants.length}</Badge>
        </h2>
        <div className="flex items-center gap-2">
          {isHost && (
            <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="flex items-center gap-1">
                  <UserPlus className="h-4 w-4" />
                  <span>Invite</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Invite Friends</DialogTitle>
                  <DialogDescription>
                    Select friends to invite to this room
                  </DialogDescription>
                </DialogHeader>
                
                <div className="py-4">
                  <Input
                    placeholder="Search friends..."
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    className="mb-4"
                  />
                  
                  <div className="relative">
                    <ScrollArea className="h-[300px] pr-4">
                      {filteredFriends.length > 0 ? (
                        <div className="space-y-2">
                          {filteredFriends.map(friend => (
                            <div 
                              key={friend.id}
                              className={`flex items-center justify-between p-2 rounded-md border ${
                                selectedFriends.includes(friend.id) 
                                  ? 'bg-primary/10 border-primary' 
                                  : 'hover:bg-secondary/50'
                              }`}
                              onClick={() => toggleFriendSelection(friend.id)}
                            >
                              <div className="flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                  {friend.photoURL && (
                                    <AvatarImage src={friend.photoURL} alt={friend.displayName} />
                                  )}
                                  <AvatarFallback>
                                    {friend.displayName.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="font-medium">{friend.displayName}</span>
                              </div>
                              
                              {friend.status && (
                                <Badge 
                                  variant={
                                    friend.status === 'online' ? 'default' : 
                                    friend.status === 'away' ? 'secondary' : 'outline'
                                  }
                                  className="text-xs"
                                >
                                  {friend.status}
                                </Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4 text-muted-foreground">
                          {loading ? 'Loading friends...' : 'No friends found'}
                        </div>
                      )}
                    </ScrollArea>
                  </div>
                </div>
                
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => setInviteDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleInviteFriends}
                    disabled={selectedFriends.length === 0}
                  >
                    Invite {selectedFriends.length > 0 ? `(${selectedFriends.length})` : ''}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
          
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="participants" className="flex-1 flex flex-col">
        <TabsList className="w-full justify-start px-4 pt-2 bg-transparent">
          <TabsTrigger value="participants">In Room</TabsTrigger>
          <TabsTrigger value="friends">Friends</TabsTrigger>
        </TabsList>
        
        <TabsContent value="participants" className="flex-1 mt-0 p-0">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-2">
              {sortedParticipants.map(user => (
                <div 
                  key={user.id} 
                  className="flex items-center justify-between p-2 rounded-md hover:bg-secondary/30"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      {user.photoURL && (
                        <AvatarImage src={user.photoURL} alt={user.displayName} />
                      )}
                      <AvatarFallback>
                        {user.displayName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{user.displayName}</span>
                        {user.isHost && (
                          <Crown className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                        )}
                        {user.id === currentUserId && (
                          <span className="text-xs text-muted-foreground">(You)</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {isHost && user.id !== currentUserId && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleKickUser(user.id, user.displayName)}>
                          <UserMinus className="h-4 w-4 mr-2 text-destructive" />
                          <span>Kick from Room</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="friends" className="flex-1 mt-0 p-0">
          <div className="p-4">
            <Input
              placeholder="Search friends..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="mb-4"
            />
          </div>
          
          <ScrollArea className="h-[calc(100%-76px)]">
            <div className="px-4 pb-4 space-y-2">
              {filteredFriends.length > 0 ? (
                filteredFriends.map(friend => {
                  const isInRoom = participants.some(p => p.id === friend.id);
                  
                  return (
                    <div 
                      key={friend.id} 
                      className="flex items-center justify-between p-2 rounded-md hover:bg-secondary/30"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          {friend.photoURL && (
                            <AvatarImage src={friend.photoURL} alt={friend.displayName} />
                          )}
                          <AvatarFallback>
                            {friend.displayName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-medium">{friend.displayName}</span>
                          {friend.status && (
                            <span className={`text-xs ${
                              friend.status === 'online' ? 'text-green-500' : 
                              friend.status === 'away' ? 'text-yellow-500' : 'text-muted-foreground'
                            }`}>
                              {friend.status}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        {isInRoom ? (
                          <Badge variant="outline" className="text-xs">In Room</Badge>
                        ) : (
                          isHost && (
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => {
                                setSelectedFriends([friend.id]);
                                setInviteDialogOpen(true);
                              }}
                            >
                              <UserPlus className="h-4 w-4" />
                            </Button>
                          )
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  {loading ? 'Loading friends...' : 'No friends found'}
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ParticipantsPanel;