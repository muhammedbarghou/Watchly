// src/hooks/use-friends.ts

import { useState, useEffect, useCallback } from 'react';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp,
  onSnapshot,
  DocumentData,
  Timestamp,
  addDoc
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';

// Standardized friend interface
export interface Friend {
  id: string;
  displayName: string;
  photoURL: string | null;
  status: 'online' | 'offline' | 'in-room';
  roomId?: string;
  roomName?: string;
  lastSeen?: Date | null;
}

// Friend request interface
export interface FriendRequest {
  id: string;
  senderId: string;
  recipientId: string;
  status: 'pending' | 'accepted' | 'declined';
  timestamp: Timestamp;
  senderName?: string;
  senderPhotoURL?: string;
}

export function useFriends() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<FriendRequest[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  // Fetch friends list with their current status
  useEffect(() => {
    if (!currentUser?.uid) return;

    setLoading(true);
    
    // Subscribe to friends collection changes
    const userRef = doc(db, 'users', currentUser.uid);
    
    const unsubscribe = onSnapshot(userRef, async (userDoc) => {
      if (userDoc.exists()) {
        const userData = userDoc.data() as DocumentData;
        const friendsArray = userData.friends || [];
        
        // Get room information to check if friends are in rooms
        const roomsRef = collection(db, 'rooms');
        const roomsSnapshot = await getDocs(roomsRef);
        const activeRooms = roomsSnapshot.docs.map(doc => ({
          id: doc.data().roomId,
          name: doc.data().name,
          participants: doc.data().participants || []
        }));
        
        // Fetch each friend's current data
        const friendsData = await Promise.all(
          friendsArray.map(async (friend: any) => {
            try {
              const friendRef = doc(db, 'users', friend.uid);
              const friendDoc = await getDoc(friendRef);
              
              if (friendDoc.exists()) {
                const friendData = friendDoc.data() as DocumentData;
                
                // Check if friend is in a room
                let friendStatus = friendData.isOnline ? 'online' : 'offline';
                let roomId = undefined;
                let roomName = undefined;
                
                // Find if friend is in any active room
                for (const room of activeRooms) {
                  const roomParticipants = room.participants.map((p: any) => 
                    typeof p === 'string' ? p : p.id
                  );
                  
                  if (roomParticipants.includes(friend.uid)) {
                    friendStatus = 'in-room';
                    roomId = room.id;
                    roomName = room.name;
                    break;
                  }
                }
                
                return {
                  id: friend.uid,
                  displayName: friendData.displayName || 'Anonymous',
                  photoURL: friendData.photoURL || null,
                  status: friendStatus as Friend['status'],
                  roomId,
                  roomName,
                  lastSeen: friendData.lastSeen ? friendData.lastSeen.toDate() : null
                } as Friend;
              }
              return null;
            } catch (error) {
              console.error('Error fetching friend data:', error);
              return null;
            }
          })
        );
        
        setFriends(friendsData.filter(Boolean) as Friend[]);
      } else {
        setFriends([]);
      }
      
      setLoading(false);
    });
    
    // Subscribe to incoming friend requests
    const incomingRequestsRef = collection(db, 'friendRequests');
    const incomingQuery = query(
      incomingRequestsRef, 
      where('recipientId', '==', currentUser.uid),
      where('status', '==', 'pending')
    );
    
    const unsubscribeIncoming = onSnapshot(incomingQuery, async (snapshot) => {
      const requests: FriendRequest[] = [];
      
      for (const docSnapshot of snapshot.docs) {
        const request = docSnapshot.data() as FriendRequest;
        request.id = docSnapshot.id;
        
        // Get sender details
        try {
          const senderDoc = await getDoc(doc(db, 'users', request.senderId));
          if (senderDoc.exists()) {
            const senderData = senderDoc.data() as DocumentData;
            request.senderName = senderData.displayName || 'Anonymous';
            request.senderPhotoURL = senderData.photoURL || null;
          }
        } catch (error) {
          console.error('Error fetching sender details:', error);
        }
        
        requests.push(request);
      }
      
      setIncomingRequests(requests);
    });
    
    // Subscribe to outgoing friend requests
    const outgoingQuery = query(
      incomingRequestsRef, 
      where('senderId', '==', currentUser.uid),
      where('status', '==', 'pending')
    );
    
    const unsubscribeOutgoing = onSnapshot(outgoingQuery, (snapshot) => {
      const requests = snapshot.docs.map(docSnapshot => ({
        id: docSnapshot.id,
        ...docSnapshot.data(),
      })) as FriendRequest[];
      
      setOutgoingRequests(requests);
    });
    
    return () => {
      unsubscribe();
      unsubscribeIncoming();
      unsubscribeOutgoing();
    };
  }, [currentUser]);

  // Send friend request
  const sendFriendRequest = useCallback(async (targetUserId: string) => {
    if (!currentUser) {
      toast.error('You need to be logged in to send friend requests');
      return false;
    }
    
    try {
      // Check if request already exists
      const friendRequestsRef = collection(db, 'friendRequests');
      const q1 = query(
        friendRequestsRef,
        where('senderId', '==', currentUser.uid),
        where('recipientId', '==', targetUserId),
        where('status', '==', 'pending')
      );
      
      const q2 = query(
        friendRequestsRef,
        where('senderId', '==', targetUserId),
        where('recipientId', '==', currentUser.uid),
        where('status', '==', 'pending')
      );
      
      const [outgoingSnapshot, incomingSnapshot] = await Promise.all([
        getDocs(q1),
        getDocs(q2)
      ]);
      
      if (!outgoingSnapshot.empty) {
        toast.info('You already sent a friend request to this user');
        return false;
      }
      
      if (!incomingSnapshot.empty) {
        toast.info('This user already sent you a friend request. Check your notifications!');
        return false;
      }
      
      // Check if they're already friends
      const userRef = doc(db, 'users', currentUser.uid);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data() as DocumentData;
        const friendsArray = userData.friends || [];
        
        if (friendsArray.some((friend: any) => friend.uid === targetUserId)) {
          toast.info('You are already friends with this user');
          return false;
        }
      }
      
      // Create a new document with auto-generated ID
      await addDoc(collection(db, 'friendRequests'), {
        senderId: currentUser.uid,
        recipientId: targetUserId,
        status: 'pending',
        timestamp: serverTimestamp()
      });
      
      toast.success('Friend request sent');
      return true;
    } catch (error) {
      console.error('Error sending friend request:', error);
      toast.error('Failed to send friend request');
      return false;
    }
  }, [currentUser]);

  // Accept friend request
  const acceptFriendRequest = useCallback(async (requestId: string) => {
    if (!currentUser) return false;
    
    try {
      console.log('Accepting friend request with ID:', requestId);
      
      const requestRef = doc(db, 'friendRequests', requestId);
      const requestDoc = await getDoc(requestRef);
      
      if (!requestDoc.exists()) {
        console.log('Friend request not found:', requestId);
        toast.error('Friend request no longer exists');
        return false;
      }
      
      const requestData = requestDoc.data();
      console.log('Friend request data:', requestData);
      
      // Make sure current user is the recipient
      if (requestData.recipientId !== currentUser.uid) {
        console.log('Current user is not the recipient');
        toast.error('You are not authorized to accept this request');
        return false;
      }
      
      // Add to recipient's friends list (current user)
      const recipientRef = doc(db, 'users', currentUser.uid);
      const recipientDoc = await getDoc(recipientRef);
      
      // Add to sender's friends list
      const senderRef = doc(db, 'users', requestData.senderId);
      const senderDoc = await getDoc(senderRef);
      
      if (recipientDoc.exists() && senderDoc.exists()) {
        const recipientData = recipientDoc.data() as DocumentData;
        const senderData = senderDoc.data() as DocumentData;
        
        // Get current friends arrays (or empty arrays if none exist)
        const recipientFriends = recipientData.friends || [];
        const senderFriends = senderData.friends || [];
        
        // Check if they're already friends
        const alreadyFriends = recipientFriends.some(
          (friend: any) => friend.uid === requestData.senderId
        );
        
        if (!alreadyFriends) {
          // Update recipient's friends list
          await updateDoc(recipientRef, {
            friends: [
              ...recipientFriends,
              {
                uid: requestData.senderId,
                displayName: senderData.displayName || 'Anonymous',
                photoURL: senderData.photoURL || null
              }
            ]
          });
          
          // Update sender's friends list
          await updateDoc(senderRef, {
            friends: [
              ...senderFriends,
              {
                uid: currentUser.uid,
                displayName: currentUser.displayName || 'Anonymous',
                photoURL: currentUser.photoURL || null
              }
            ]
          });
        }
        
        // Delete the request
        await deleteDoc(requestRef);
        
        toast.success('Friend request accepted');
        return true;
      } else {
        console.log('Recipient or sender not found');
        toast.error('User data not found');
        return false;
      }
    } catch (error) {
      console.error('Error accepting friend request:', error);
      toast.error('Failed to accept friend request');
      return false;
    }
  }, [currentUser]);

  // Decline friend request
  const declineFriendRequest = useCallback(async (requestId: string) => {
    if (!currentUser) return false;
    
    try {
      console.log('Declining friend request with ID:', requestId);
      
      const requestRef = doc(db, 'friendRequests', requestId);
      const requestDoc = await getDoc(requestRef);
      
      if (!requestDoc.exists()) {
        toast.error('Friend request no longer exists');
        return false;
      }
      
      const requestData = requestDoc.data();
      
      // Make sure current user is the recipient
      if (requestData.recipientId !== currentUser.uid) {
        toast.error('You are not authorized to decline this request');
        return false;
      }
      
      // Delete the request
      await deleteDoc(requestRef);
      
      toast.success('Friend request declined');
      return true;
    } catch (error) {
      console.error('Error declining friend request:', error);
      toast.error('Failed to decline friend request');
      return false;
    }
  }, [currentUser]);

  // Remove friend
  const removeFriend = useCallback(async (friendId: string) => {
    if (!currentUser) return false;
    
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data() as DocumentData;
        const friendsArray = userData.friends || [];
        
        // Remove from current user's friends list
        await updateDoc(userRef, {
          friends: friendsArray.filter((friend: any) => friend.uid !== friendId)
        });
        
        // Remove current user from friend's friends list
        const friendRef = doc(db, 'users', friendId);
        const friendDoc = await getDoc(friendRef);
        
        if (friendDoc.exists()) {
          const friendData = friendDoc.data() as DocumentData;
          const friendsFriendsArray = friendData.friends || [];
          
          await updateDoc(friendRef, {
            friends: friendsFriendsArray.filter((friend: any) => friend.uid !== currentUser.uid)
          });
        }
        
        toast.success('Friend removed');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error removing friend:', error);
      toast.error('Failed to remove friend');
      return false;
    }
  }, [currentUser]);

  // Search users by custom UID (friend code)
  const searchUsersByCode = useCallback(async (friendCode: string) => {
    if (!friendCode || !currentUser) return [];
    
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('customUID', '==', friendCode));
      const querySnapshot = await getDocs(q);
      
      const users: any[] = [];
      
      querySnapshot.forEach((docSnapshot) => {
        if (docSnapshot.id !== currentUser.uid) {
          users.push({
            id: docSnapshot.id,
            ...docSnapshot.data()
          });
        }
      });
      
      return users;
    } catch (error) {
      console.error('Error searching users:', error);
      return [];
    }
  }, [currentUser]);

  return {
    friends,
    incomingRequests,
    outgoingRequests,
    loading,
    sendFriendRequest,
    acceptFriendRequest,
    declineFriendRequest,
    removeFriend,
    searchUsersByCode
  };
}