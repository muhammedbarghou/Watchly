import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  query,
  where,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  DocumentData,
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';

export type NotificationType = 'friend_request' | 'room_invitation';

export interface BaseNotification {
  id: string;
  type: NotificationType;
  recipientId: string;
  senderId: string;
  senderName?: string;
  senderPhotoURL?: string;
  timestamp: Timestamp;
  read: boolean;
  message?: string;
}

// Friend request notification
export interface FriendRequestNotification extends BaseNotification {
  type: 'friend_request';
  requestId: string;
}

// Room invitation notification
export interface RoomInvitationNotification extends BaseNotification {
  type: 'room_invitation';
  roomId: string;
  roomName: string;
  documentId: string; // Firestore document ID for the room
}

// Union type of all notification types
export type Notification = 
  | FriendRequestNotification 
  | RoomInvitationNotification;

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const { currentUser } = useAuth();

  // Fetch notifications
  useEffect(() => {
    if (!currentUser?.uid) return;
    
    setLoading(true);
    
    // Create notifications collection reference
    const notificationsRef = collection(db, 'users', currentUser.uid, 'notifications');
    
    // Query for notifications, most recent first, limit to 50
    const notificationsQuery = query(
      notificationsRef,
      orderBy('timestamp', 'desc'),
      limit(50)
    );
    
    // Friend requests query
    const friendRequestsQuery = query(
      collection(db, 'friendRequests'),
      where('recipientId', '==', currentUser.uid),
      where('status', '==', 'pending')
    );
    
    // Subscribe to notifications changes
    const unsubscribeNotifications = onSnapshot(notificationsQuery, async (snapshot) => {
      const notificationsData: Notification[] = [];
      
      // Process each notification
      for (const docSnapshot of snapshot.docs) {
        const notificationData = docSnapshot.data() as DocumentData;
        
        // Skip friend_joined_room notifications
        if (notificationData.type === 'friend_joined_room') continue;
        
        let notification: Notification = {
          id: docSnapshot.id,
          ...notificationData,
          timestamp: notificationData.timestamp
        } as Notification;
        
        // If sender details are not included, fetch them
        if (notificationData.senderId && !notificationData.senderName) {
          try {
            const senderDoc = await getDoc(doc(db, 'users', notificationData.senderId));
            if (senderDoc.exists()) {
              const senderData = senderDoc.data() as DocumentData;
              notification.senderName = senderData.displayName || 'Anonymous';
              notification.senderPhotoURL = senderData.photoURL || null;
            }
          } catch (error) {
            console.error('Error fetching sender details:', error);
          }
        }
        
        notificationsData.push(notification);
      }
      
      // Update notifications without friend requests (which will be added separately)
      setNotifications(prev => {
        // Keep only non-friend request notifications from previous state
        const nonFriendRequestNotifications = prev.filter(n => n.type !== 'friend_request');
        
        // Filter out friend requests from new notifications as well (to avoid duplicates)
        const filteredNewNotifications = notificationsData.filter(n => n.type !== 'friend_request');
        
        // Combine with any friend request notifications that already exist
        const friendRequestNotifications = prev.filter(n => n.type === 'friend_request');
        
        return [...filteredNewNotifications, ...friendRequestNotifications];
      });
    });
    
    // Subscribe to friend requests and convert them to notifications
    const unsubscribeFriendRequests = onSnapshot(friendRequestsQuery, async (snapshot) => {
      const friendRequestNotifications: FriendRequestNotification[] = [];
      
      for (const docSnapshot of snapshot.docs) {
        const requestData = docSnapshot.data();
        
        try {
          // Get sender details
          const senderRef = doc(db, 'users', requestData.senderId);
          const senderDoc = await getDoc(senderRef);
          
          if (senderDoc.exists()) {
            const senderData = senderDoc.data();
            
            // Create notification object
            const notification: FriendRequestNotification = {
              id: docSnapshot.id, // Use the friend request document ID
              type: 'friend_request',
              recipientId: currentUser.uid,
              senderId: requestData.senderId,
              senderName: senderData.displayName || 'Anonymous',
              senderPhotoURL: senderData.photoURL || null,
              timestamp: requestData.timestamp,
              read: false,
              message: 'sent you a friend request',
              requestId: docSnapshot.id // Store reference to the original request
            };
            
            friendRequestNotifications.push(notification);
          }
        } catch (error) {
          console.error('Error processing friend request:', error);
        }
      }
      
      // Update notifications with friend requests
      setNotifications(prev => {
        // Filter out any existing friend requests to avoid duplicates
        const nonFriendRequestNotifications = prev.filter(n => n.type !== 'friend_request');
        
        // Add the new friend request notifications
        return [...nonFriendRequestNotifications, ...friendRequestNotifications];
      });
      
      // Calculate total unread count
      const totalNotifications = await getDoc(doc(db, 'users', currentUser.uid, 'notificationStats'));
      const unreadNotifications = totalNotifications.exists() 
        ? (totalNotifications.data().unreadCount || 0) 
        : 0;
      
      setUnreadCount(unreadNotifications + friendRequestNotifications.length);
      setLoading(false);
    });
    
    return () => {
      unsubscribeNotifications();
      unsubscribeFriendRequests();
    };
  }, [currentUser]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    if (!currentUser?.uid) return;
    
    // Check if this is a friend request notification (which doesn't have a document in notifications collection)
    const matchingNotification = notifications.find(n => n.id === notificationId);
    
    if (matchingNotification?.type === 'friend_request') {
      // For friend requests, we just mark it as read in the local state
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId 
            ? { ...n, read: true } 
            : n
        )
      );
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
      return;
    }
    
    // For regular notifications, update the document
    try {
      const notificationRef = doc(db, 'users', currentUser.uid, 'notifications', notificationId);
      await updateDoc(notificationRef, { read: true });
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId 
            ? { ...n, read: true } 
            : n
        )
      );
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, [currentUser, notifications]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    if (!currentUser?.uid) return;
    
    try {
      // For regular notifications, update documents
      const updatePromises = notifications
        .filter(n => !n.read && n.type !== 'friend_request')
        .map(notification => {
          const notificationRef = doc(db, 'users', currentUser.uid, 'notifications', notification.id);
          return updateDoc(notificationRef, { read: true });
        });
      
      await Promise.all(updatePromises);
      
      // Update local state for all notifications
      setNotifications(prev => 
        prev.map(n => ({ ...n, read: true }))
      );
      
      // Reset unread count
      setUnreadCount(0);
      
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast.error('Failed to mark notifications as read');
    }
  }, [currentUser, notifications]);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId: string) => {
    if (!currentUser?.uid) return;
    
    // Check if this is a friend request notification
    const matchingNotification = notifications.find(n => n.id === notificationId);
    
    if (matchingNotification?.type === 'friend_request') {
      // For friend requests, we don't delete the actual request document
      // Just remove it from the UI
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      
      // Update unread count if it was unread
      if (!matchingNotification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
      return;
    }
    
    // For regular notifications, delete the document
    try {
      const notificationRef = doc(db, 'users', currentUser.uid, 'notifications', notificationId);
      await deleteDoc(notificationRef);
      
      // Update local state
      const notification = notifications.find(n => n.id === notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      
      // Update unread count if it was unread
      if (notification && !notification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    }
  }, [currentUser, notifications]);

  // Send room invitation notification
  const sendRoomInvitation = useCallback(async (
    recipientId: string,
    roomId: string,
    roomName: string,
    documentId: string
  ) => {
    if (!currentUser?.uid) {
      toast.error('You must be logged in to invite friends');
      return false;
    }
    
    try {
      // Create notification in recipient's collection
      const notificationsRef = collection(db, 'users', recipientId, 'notifications');
      
      await addDoc(notificationsRef, {
        type: 'room_invitation',
        recipientId,
        senderId: currentUser.uid,
        senderName: currentUser.displayName || 'Anonymous',
        senderPhotoURL: currentUser.photoURL || null,
        timestamp: serverTimestamp(),
        read: false,
        message: `invited you to join a watch room`,
        roomId,
        roomName,
        documentId
      });
      
      return true;
    } catch (error) {
      console.error('Error sending room invitation:', error);
      toast.error('Failed to send invitation');
      return false;
    }
  }, [currentUser]);

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    sendRoomInvitation
  };
}