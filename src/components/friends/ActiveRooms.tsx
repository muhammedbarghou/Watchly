// src/components/friends/ActiveRooms.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useFriends } from '@/hooks/use-friends';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Video, User, Users, Clock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';

interface ActiveRoom {
  id: string;
  roomId: string;
  name: string;
  hostName: string;
  hostId: string;
  hostPhotoURL?: string;
  friendsInRoom: {
    id: string;
    displayName: string;
    photoURL?: string;
  }[];
  participantCount: number;
  createdAt: Date;
  videoUrl: string;
}

export function ActiveRooms() {
  const [activeRooms, setActiveRooms] = useState<ActiveRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const { friends } = useFriends();
  const navigate = useNavigate();

  // Fetch active rooms where friends are participating
  useEffect(() => {
    const fetchActiveRooms = async () => {
      if (friends.length === 0) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // Get all rooms
        const roomsRef = collection(db, 'rooms');
        const roomsSnapshot = await getDocs(roomsRef);
        
        const roomsWithFriends: ActiveRoom[] = [];
        
        // Check each room for friend participation
        for (const roomDoc of roomsSnapshot.docs) {
          const roomData = roomDoc.data();
          
          // Get participants in this room
          const participantsRef = collection(db, 'rooms', roomDoc.id, 'users');
          const participantsSnapshot = await getDocs(participantsRef);
          
          const participantIds = participantsSnapshot.docs.map(doc => doc.id);
          const friendsInThisRoom = friends.filter(friend => 
            participantIds.includes(friend.id)
          );
          
          // Only include rooms where friends are present
          if (friendsInThisRoom.length > 0) {
            // Find host
            const hostParticipant = participantsSnapshot.docs
              .find(doc => doc.data().isHost);
            
            // Create room data
            const room: ActiveRoom = {
              id: roomDoc.id,
              roomId: roomData.roomId,
              name: roomData.name,
              hostName: hostParticipant?.data().displayName || 'Unknown',
              hostId: hostParticipant?.id || '',
              hostPhotoURL: hostParticipant?.data().photoURL,
              friendsInRoom: friendsInThisRoom.map(friend => ({
                id: friend.id,
                displayName: friend.displayName,
                photoURL: friend.photoURL || undefined
              })),
              participantCount: participantsSnapshot.size,
              createdAt: roomData.createdAt?.toDate() || new Date(),
              videoUrl: roomData.videoUrl
            };
            
            roomsWithFriends.push(room);
          }
        }
        
        // Sort rooms by most recently created
        roomsWithFriends.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        
        setActiveRooms(roomsWithFriends);
      } catch (error) {
        console.error('Error fetching active rooms:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchActiveRooms();
  }, [friends]);

  // Handle joining a room
  const handleJoinRoom = (roomId: string) => {
    navigate(`/room/${roomId}?source=friendList`);
  };

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-[120px] w-full" />
        <Skeleton className="h-[120px] w-full" />
      </div>
    );
  }

  if (activeRooms.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <Video className="mx-auto h-12 w-12 text-muted-foreground opacity-20 mb-3" />
            <h3 className="text-lg font-medium mb-2">No Active Watch Rooms</h3>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto">
              None of your friends are currently in a watch room. When they join one, it will appear here.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold flex items-center gap-2">
        <Video className="w-5 h-5" />
        Active Watch Rooms
      </h2>
      
      {activeRooms.map((room) => (
        <Card key={room.id} className="overflow-hidden transition-all hover:shadow-md">
          <CardHeader className="p-4 pb-0">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">{room.name}</CardTitle>
                <CardDescription className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>
                    Created {formatDistanceToNow(room.createdAt, { addSuffix: true })}
                  </span>
                </CardDescription>
              </div>
              <Badge variant="outline" className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {room.participantCount}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <p className="text-sm text-muted-foreground">Hosted by:</p>
                  <div className="flex items-center gap-2">
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={room.hostPhotoURL || undefined} />
                      <AvatarFallback>
                        <User className="w-3 h-3" />
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{room.hostName}</span>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Friends in this room:</p>
                  <div className="flex -space-x-2 overflow-hidden">
                    {room.friendsInRoom.map((friend) => (
                      <Avatar key={friend.id} className="w-8 h-8 border-2 border-background">
                        <AvatarImage src={friend.photoURL} />
                        <AvatarFallback>
                          {friend.displayName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                    <div className="pl-2 flex items-center">
                      <span className="text-xs text-muted-foreground">
                        {room.friendsInRoom.length > 1 
                          ? `${room.friendsInRoom[0].displayName} and ${room.friendsInRoom.length - 1} more` 
                          : room.friendsInRoom[0].displayName}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <Button 
                className="w-full sm:w-auto"
                onClick={() => handleJoinRoom(room.roomId)}
              >
                <Video className="w-4 h-4 mr-2" />
                Join Room
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}