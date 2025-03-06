import { useState, useEffect } from 'react';
import { Search, UserMinus, MessageCircle, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  doc, 
  getDoc, 
  getFirestore, 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  serverTimestamp 
} from 'firebase/firestore';
import { useAuth } from '@/hooks/use-auth';
import { MainLayout } from '../layout/MainLayout';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface Friend {
  id: string;
  name: string;
  photoURL: string | null;
  status: 'online' | 'offline';
  lastSeen?: string;
}

export default function FriendsList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [friends, setFriends] = useState<Friend[]>([]);
  const { currentUser } = useAuth();
  const db = getFirestore();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFriends = async () => {
      if (!currentUser?.uid) return;

      try {
        const userRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          const friendsArray = userData.friends || [];

          const mappedFriends = await Promise.all(
            friendsArray.map(async (friend: any) => {
              const friendRef = doc(db, 'users', friend.uid);
              const friendDoc = await getDoc(friendRef);

              if (friendDoc.exists()) {
                const friendData = friendDoc.data();
                return {
                  id: friend.uid,
                  name: friendData.displayName || 'Anonymous',
                  photoURL: friendData.photoURL || null,
                  status: friendData.isOnline ? 'online' : 'offline',
                  lastSeen: friendData.lastSeen
                    ? new Date(friendData.lastSeen.toDate()).toLocaleTimeString()
                    : undefined,
                };
              }
              return null;
            })
          );
          setFriends(mappedFriends.filter((friend) => friend !== null) as Friend[]);
        }
      } catch (error) {
        console.error('Error fetching friends:', error);
      }
    };

    fetchFriends();
  }, [currentUser]);

  const filteredFriends = friends.filter((friend) =>
    friend.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    },
    exit: {
      x: -100,
      opacity: 0,
      transition: {
        duration: 0.3
      }
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
      
      // Get friend details for the chat document
      const friendDoc = await getDoc(doc(db, 'users', friendId));
      const currentUserDoc = await getDoc(doc(db, 'users', currentUser.uid));
      
      if (!friendDoc.exists() || !currentUserDoc.exists()) {
        toast.error('Could not create chat');
        return;
      }
      
      const friendData = friendDoc.data();
      const userData = currentUserDoc.data();
      
      // Create participants array
      const participants = [
        {
          id: friendId,
          name: friendData.displayName || 'User',
          photo: friendData.photoURL || null
        },
        {
          id: currentUser.uid,
          name: userData.displayName || 'User',
          photo: userData.photoURL || null
        }
      ];
      
      // Create new chat
      const chatRef = await addDoc(collection(db, 'chats'), {
        name: friendData.displayName || 'Chat',
        isGroup: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        participantIds: [friendId, currentUser.uid],
        participants: participants
      });
      
      // Add initial system message
      await addDoc(collection(db, 'chats', chatRef.id, 'messages'), {
        text: 'Chat started',
        senderId: 'system',
        senderName: 'System',
        timestamp: serverTimestamp()
      });
      
      // Navigate to the chat page
      navigate('/chat');
      toast.success(`Chat with ${friendData.displayName} started`);
      
    } catch (error) {
      console.error('Error creating chat:', error);
      toast.error('Failed to start conversation');
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-10 px-6 max-w-4xl">
        <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-800">
          <CardContent className="p-6">
            <motion.div 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="flex items-center justify-between mb-8"
            >
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-netflix-red" />
                <h1 className="text-3xl font-bold text-white">Friends</h1>
                <span className="bg-netflix-red px-3 py-1 rounded-full text-sm font-medium">
                  {friends.length}
                </span>
              </div>
            </motion.div>

            <motion.div 
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="relative mb-6"
            >
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search friends..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-800/50 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-netflix-red transition-all duration-300"
              />
            </motion.div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-4"
            >
              <AnimatePresence>
                {filteredFriends.map((friend) => (
                  <motion.div
                    key={friend.id}
                    variants={itemVariants}
                    layout
                    className="flex items-center space-x-4 p-4 bg-gray-800/30 rounded-xl hover:bg-gray-800/50 transition-colors duration-300"
                  >
                    <motion.div 
                      className="relative w-12 h-12"
                      whileHover={{ scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      <div className="w-full h-full rounded-full bg-gray-700 overflow-hidden">
                        {friend.photoURL ? (
                          <img
                            src={friend.photoURL}
                            alt={friend.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            {friend.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-gray-900 ${
                        friend.status === 'online' ? 'bg-green-500' : 'bg-gray-500'
                      }`} />
                    </motion.div>

                    <div className="flex-1">
                      <div className="text-white font-semibold text-lg">{friend.name}</div>
                      <div className="text-sm text-gray-400">
                        {friend.status === 'online' ? (
                          <span className="text-green-500">● Online</span>
                        ) : (
                          `Last seen ${friend.lastSeen}`
                        )}
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-3 text-gray-400 hover:text-white rounded-xl hover:bg-netflix-red/20 transition-colors"
                        title="Message friend"
                        onClick={() => handleMessageFriend(friend.id)}
                      >
                        <MessageCircle className="w-5 h-5" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-3 text-gray-400 hover:text-red-500 rounded-xl hover:bg-red-500/10 transition-colors"
                        title="Remove friend"
                      >
                        <UserMinus className="w-5 h-5" />
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}