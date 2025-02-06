import { useState, useEffect } from 'react';
import { Search, UserMinus, MessageCircle, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { doc, getDoc, getFirestore } from 'firebase/firestore';
import { useAuth } from '@/hooks/use-auth';
import { MainLayout } from '../layout/MainLayout';
import { Card, CardContent } from '@/components/ui/card';

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