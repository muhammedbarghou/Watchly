import { User, Video, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { MainLayout } from '@/components/layout/MainLayout';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

interface Friend {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'in-room';
  roomId?: string;
  lastSeen?: string;
}

const friends: Friend[] = [
  { id: '1', name: 'John Doe', status: 'in-room', roomId: 'movie-night' },
  { id: '2', name: 'Jane Smith', status: 'online', lastSeen: 'Active now' },
  { id: '3', name: 'Mike Johnson', status: 'offline', lastSeen: '2 hours ago' },
  { id: '4', name: 'Sarah Wilson', status: 'online', lastSeen: 'Active now' },
  { id: '5', name: 'Alex Brown', status: 'in-room', roomId: 'horror-marathon' },
  { id: '6', name: 'Emma Davis', status: 'offline', lastSeen: '1 day ago' },
];

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

  const filteredFriends = friends.filter(friend => {
    const matchesSearch = friend.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || friend.status === selectedFilter;
    return matchesSearch && matchesFilter;
  });

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
                        <div className="w-10 h-10 rounded-full bg-netflix-red flex items-center justify-center">
                          <User className="w-6 h-6 text-white" />
                        </div>
                        <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ${getStatusColor(friend.status)} ring-2 ring-white`} />
                      </div>
                      <div>
                        <h3 className="font-medium text-dark dark:text-white">{friend.name}</h3>
                        <p className="text-sm text-gray-400">
                          {friend.status === 'in-room' ? (
                            <span className="flex items-center gap-1">
                              <Video className="w-3 h-3" />
                              Watching in {friend.roomId}
                            </span>
                          ) : (
                            friend.lastSeen
                          )}
                        </p>
                      </div>
                    </div>
                    {friend.status === 'in-room' ? (
                      <Button variant="default" className="gap-2">
                        <Video className="w-4 h-4" />
                        Join Room
                      </Button>
                    ) : friend.status === 'online' ? (
                      <Button variant="outline" className="gap-2">
                        <Video className="w-4 h-4" />
                        Invite
                      </Button>
                    ) : null}
                  </CardContent>
                  <Separator />
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </ScrollArea>
      </motion.div>
    </MainLayout>
  );
}