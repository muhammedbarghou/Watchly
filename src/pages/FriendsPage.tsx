// Modified FriendsPage.tsx

import { useState, useEffect } from 'react';
import { User, Video, Search, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { MainLayout } from '@/components/layout/MainLayout';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, getFirestore, collection, getDocs, where, query } from 'firebase/firestore';
import { useAuth } from '@/hooks/use-auth';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFriends } from '@/hooks/use-friends';
import { FriendSearch } from '@/components/friends/FriendSearch';
import { FriendListItem } from '@/components/friends/FriendListItem';
import { ActiveRooms } from '@/components/friends/ActiveRooms';

export default function FriendsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'online' | 'in-room' | 'offline'>('all');
  const [showAddFriend, setShowAddFriend] = useState(false);
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const { 
    friends, 
    loading, 
    removeFriend 
  } = useFriends();

  // Filter friends based on search query and filter
  const filteredFriends = friends.filter(friend => {
    const matchesSearch = friend.displayName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || friend.status === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  // Handle joining a room
  const handleJoinRoom = (roomId: string) => {
    if (roomId) {
      navigate(`/room/${roomId}?source=friendList`);
    }
  };

  // Handle starting a chat with a friend
  const handleMessageFriend = async (friendId: string) => {
    if (!currentUser) return;
    
    try {
      // Check if there's already a chat with this friend
      const db = getFirestore();
      const chatsRef = collection(db, 'chats');
      const q = query(
        chatsRef, 
        where('isGroup', '==', false),
        where('participantIds', 'array-contains', currentUser.uid)
      );
      
      const querySnapshot = await getDocs(q);
      let existingChatId = null;
      
      // Look for an existing chat with just these two users
      querySnapshot.forEach(doc => {
        const chatData = doc.data();
        if (
          chatData.participantIds.length === 2 && 
          chatData.participantIds.includes(friendId)
        ) {
          existingChatId = doc.id;
        }
      });
      
      if (existingChatId) {
        // Navigate to existing chat
        navigate('/chat');
        toast.success('Opening existing conversation');
        return;
      }
      
      // If no existing chat, create a new one (this would typically be implemented)
      // For now, just navigate to chat page
      navigate('/chat');
      toast.success('Starting new conversation');
      
    } catch (error) {
      console.error('Error handling message friend:', error);
      toast.error('Failed to start conversation');
    }
  };

  // Handle removing a friend
  const handleRemoveFriend = async (friendId: string) => {
    if (window.confirm('Are you sure you want to remove this friend?')) {
      await removeFriend(friendId);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  return (
    <MainLayout>
      <div className="container px-4 py-8 mx-auto max-w-6xl">
        <motion.div 
          className="space-y-6"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <motion.h1 
              className="text-3xl font-bold"
              variants={itemVariants}
            >
              Friends
            </motion.h1>
            
            <motion.div variants={itemVariants} className="flex gap-2 w-full sm:w-auto">
              <Button 
                onClick={() => setShowAddFriend(!showAddFriend)}
                variant={showAddFriend ? "secondary" : "default"}
              >
                {showAddFriend ? "Cancel" : "Add Friend"}
              </Button>
            </motion.div>
          </div>

          {showAddFriend && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-4">Add a Friend</h2>
                  <FriendSearch onSearchComplete={() => setShowAddFriend(false)} />
                </CardContent>
              </Card>
            </motion.div>
          )}

          <Tabs defaultValue="friends" className="w-full">
            <motion.div variants={itemVariants}>
              <TabsList className="w-full max-w-md grid grid-cols-2">
                <TabsTrigger value="friends">
                  <User className="w-4 h-4 mr-2" />
                  My Friends ({friends.length})
                </TabsTrigger>
                <TabsTrigger value="rooms">
                  <Video className="w-4 h-4 mr-2" />
                  Active Rooms
                </TabsTrigger>
              </TabsList>
            </motion.div>

            <TabsContent value="friends" className="mt-6">
              <motion.div variants={itemVariants} className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search friends..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="flex gap-2">
                    {(['all', 'online', 'in-room', 'offline'] as const).map((filter) => (
                      <Button
                        key={filter}
                        variant={selectedFilter === filter ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedFilter(filter)}
                        className="capitalize"
                      >
                        {filter}
                      </Button>
                    ))}
                  </div>
                </div>

                <ScrollArea className="h-[600px] pr-4">
                  {loading ? (
                    <div className="flex items-center justify-center h-40">
                      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                    </div>
                  ) : filteredFriends.length === 0 ? (
                    <div className="text-center p-8 text-muted-foreground">
                      {searchQuery || selectedFilter !== 'all' ? 
                        'No friends match your filters' : 
                        'No friends found. Add some friends to get started!'}
                    </div>
                  ) : (
                    <motion.div 
                      className="space-y-4"
                      variants={containerVariants}
                    >
                      {filteredFriends.map((friend) => (
                        <motion.div key={friend.id} variants={itemVariants}>
                          <FriendListItem
                            friend={friend}
                            onMessage={handleMessageFriend}
                            onRemove={handleRemoveFriend}
                            onJoinRoom={handleJoinRoom}
                            onInviteToRoom={() => {
                              // This should navigate to create room page with initial invitee
                              navigate('/create-room?invite=' + friend.id);
                            }}
                          />
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </ScrollArea>
              </motion.div>
            </TabsContent>

            <TabsContent value="rooms" className="mt-6">
              <ActiveRooms />
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </MainLayout>
  );
}