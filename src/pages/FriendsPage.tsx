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

interface Friend {
  id: string;
  name: string;
  photoURL: string | null;
  status: 'online' | 'offline' | 'in-room';
  roomId?: string;
  roomName?: string;
  lastSeen?: string;
}

const getStatusColor = (status: Friend['status']) => {
  switch (status) {
    case 'online':
      return 'bg-green-500';
    case 'in-room':
      return 'bg-blue-500';
    default:
      return 'bg-gray-400';
  }
};

export default function FriendsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<Friend['status'] | 'all'>('all');
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  const db = getFirestore();
  const navigate = useNavigate();

  // Fetch friends and their status
  useEffect(() => {
    const fetchFriends = async () => {
      if (!currentUser?.uid) return;

      try {
        setLoading(true);
        // Get user's friends
        const userRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          const friendsArray = userData.friends || [];

          // Get active rooms to check if friends are in any room
          const roomsRef = collection(db, 'rooms');
          const roomsSnapshot = await getDocs(roomsRef);
          const activeRooms = roomsSnapshot.docs.map(doc => ({
            id: doc.data().roomId,
            name: doc.data().name,
            participants: doc.data().participants || []
          }));

          // Map friends data with room information
          const mappedFriends = await Promise.all(
            friendsArray.map(async (friend: any) => {
              const friendRef = doc(db, 'users', friend.uid);
              const friendDoc = await getDoc(friendRef);

              if (friendDoc.exists()) {
                const friendData = friendDoc.data();
                
                // Check if friend is in a room
                let friendStatus = friendData.isOnline ? 'online' : 'offline';
                let roomId = undefined;
                let roomName = undefined;
                
                // Find if friend is in any active room
                for (const room of activeRooms) {
                  if (room.participants && room.participants.includes(friend.uid)) {
                    friendStatus = 'in-room';
                    roomId = room.id;
                    roomName = room.name;
                    break;
                  }
                }

                return {
                  id: friend.uid,
                  name: friendData.displayName || 'Anonymous',
                  photoURL: friendData.photoURL || null,
                  status: friendStatus,
                  roomId,
                  roomName,
                  lastSeen: friendData.lastSeen
                    ? new Date(friendData.lastSeen.toDate()).toLocaleTimeString()
                    : 'Unknown'
                };
              }
              return null;
            })
          );
          
          setFriends(mappedFriends.filter((friend) => friend !== null) as Friend[]);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching friends:', error);
        setLoading(false);
      }
    };

    fetchFriends();
  }, [currentUser, db]);

  // Handle filtering friends
  const filteredFriends = friends.filter(friend => {
    const matchesSearch = friend.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || friend.status === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  // Handle joining a room
  const handleJoinRoom = (roomId: string) => {
    if (roomId) {
      navigate(`/room/${roomId}`);
    }
  };

  // Handle starting a chat with a friend
  const handleMessageFriend = async (friendId: string) => {
    if (!currentUser) return;
    
    try {
      // Check if there's already a chat with this friend
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
      <motion.div 
        className="p-6 space-y-6"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <div className="flex justify-between items-center mb-6">
          <motion.h1 
            className="text-2xl font-bold"
            variants={itemVariants}
          >
            Friends List
          </motion.h1>
          <motion.div variants={itemVariants}>
            <Badge variant="outline" className="ml-2">
              {friends.length} Friends
            </Badge>
          </motion.div>
        </div>

        <motion.div 
          className="flex flex-col sm:flex-row gap-4 mb-6"
          variants={itemVariants}
        >
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
        </motion.div>

        <ScrollArea className="h-[500px] w-full rounded-lg border p-4">
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
                  <Card className="transform transition-all duration-200 hover:scale-[1.02]">
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          {friend.photoURL ? (
                            <div className="w-10 h-10 rounded-full overflow-hidden">
                              <img 
                                src={friend.photoURL} 
                                alt={friend.name} 
                                className="w-full h-full object-cover" 
                              />
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-netflix-red flex items-center justify-center">
                              <User className="w-6 h-6 text-white" />
                            </div>
                          )}
                          <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ${getStatusColor(friend.status)} ring-2 ring-white`} />
                        </div>
                        <div>
                          <h3 className="font-medium text-dark dark:text-white">{friend.name}</h3>
                          <p className="text-sm text-gray-400">
                            {friend.status === 'in-room' ? (
                              <span className="flex items-center gap-1">
                                <Video className="w-3 h-3" />
                                Watching in <span className="font-medium">{friend.roomName || friend.roomId}</span>
                              </span>
                            ) : friend.status === 'online' ? (
                              "Active now"
                            ) : (
                              `Last seen ${friend.lastSeen}`
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="gap-1"
                          onClick={() => handleMessageFriend(friend.id)}
                        >
                          <MessageCircle className="w-4 h-4" />
                          Message
                        </Button>
                        
                        {friend.status === 'in-room' ? (
                          <Button 
                            variant="default" 
                            size="sm"
                            className="gap-1"
                            onClick={() => handleJoinRoom(friend.roomId || '')}
                          >
                            <Video className="w-4 h-4" />
                            Join Room
                          </Button>
                        ) : friend.status === 'online' ? (
                          <Button variant="outline" size="sm" className="gap-1">
                            <Video className="w-4 h-4" />
                            Invite
                          </Button>
                        ) : null}
                      </div>
                    </CardContent>
                    <Separator />
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </ScrollArea>
      </motion.div>
    </MainLayout>
  );
}