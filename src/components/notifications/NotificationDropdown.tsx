import { useState } from "react";
import { Bell, Check } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { NotificationItem } from "./NotificationItem";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Notification } from "@/hooks/use-notifications";
import { useNotifications } from "@/hooks/use-notifications";
import { useFriends } from "@/hooks/use-friends";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification 
  } = useNotifications();
  
  const { acceptFriendRequest, declineFriendRequest } = useFriends();
  const navigate = useNavigate();
  
  // Filter notifications by type
  const friendRequests = notifications.filter(n => n.type === 'friend_request');
  const roomInvitations = notifications.filter(n => n.type === 'room_invitation');

  // Handle accepting friend request
  const handleAcceptFriendRequest = async (notification: Notification) => {
    if (notification.type !== 'friend_request') return;
    
    try {
      console.log('Accepting friend request with ID:', notification.id);
      
      // Use the notification ID directly which corresponds to the friendRequest document ID
      const success = await acceptFriendRequest(notification.id);
      
      if (success) {
        // No need to delete notification explicitly - it will be removed by the listener
        // when the friend request document is deleted
        setOpen(false);
        toast.success('Friend request accepted');
      }
    } catch (error) {
      console.error('Error accepting friend request:', error);
      toast.error('Failed to accept friend request');
    }
  };

  // Handle declining friend request
  const handleDeclineFriendRequest = async (notification: Notification) => {
    if (notification.type !== 'friend_request') return;
    
    try {
      console.log('Declining friend request with ID:', notification.id);
      
      // Use the notification ID directly which corresponds to the friendRequest document ID
      const success = await declineFriendRequest(notification.id);
      
      if (success) {
        // No need to delete notification explicitly - it will be removed by the listener
        // when the friend request document is deleted
        toast.success('Friend request declined');
      }
    } catch (error) {
      console.error('Error declining friend request:', error);
      toast.error('Failed to decline friend request');
    }
  };

  const handleJoinRoom = async (notification: Notification) => {
    if (notification.type !== 'room_invitation') return;
    
    // Mark as read before navigating
    await markAsRead(notification.id);
    setOpen(false);
    
    // Navigate directly to the room
    navigate(`/room/${notification.roomId}`);
  };
  
  // Handle deleting a notification
  const handleDeleteNotification = async (notification: Notification) => {
    try {
      console.log('Deleting notification:', notification.id);
      await deleteNotification(notification.id);
      toast.success('Notification dismissed');
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to dismiss notification');
    }
  };
  
  // Handle marking a notification as read
  const handleMarkAsRead = async (notification: Notification) => {
    try {
      if (!notification.read) {
        await markAsRead(notification.id);
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          className="p-2 hover:bg-gray-200 dark:hover:bg-netflix-gray rounded-lg relative transition-colors duration-200 ease-in-out"
          aria-label="Notifications"
        >
          <Bell className="w-6 h-6 dark:text-gray-400" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-xs font-bold bg-red-500 text-white rounded-full">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between px-4 py-2 border-b dark:border-gray-700">
          <h3 className="font-semibold dark:text-white">Notifications</h3>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 px-2"
                onClick={() => markAllAsRead()}
              >
                <Check className="w-4 h-4 mr-1" />
                Mark all read
              </Button>
            )}
          </div>
        </div>
        
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="all">
              All
              {unreadCount > 0 && (
                <span className="ml-1.5 w-5 h-5 flex items-center justify-center text-xs bg-gray-200 dark:bg-gray-700 rounded-full">
                  {unreadCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="friends">
              Friends
              {friendRequests.length > 0 && (
                <span className="ml-1.5 w-5 h-5 flex items-center justify-center text-xs bg-gray-200 dark:bg-gray-700 rounded-full">
                  {friendRequests.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="rooms">
              Invites
              {roomInvitations.length > 0 && (
                <span className="ml-1.5 w-5 h-5 flex items-center justify-center text-xs bg-gray-200 dark:bg-gray-700 rounded-full">
                  {roomInvitations.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>
          
          <div className="max-h-[400px] overflow-y-auto">
            <TabsContent value="all" className="space-y-2 p-2 m-0">
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onAccept={handleAcceptFriendRequest}
                    onDecline={handleDeclineFriendRequest}
                    onJoin={handleJoinRoom}
                    onDelete={handleDeleteNotification}
                    onRead={handleMarkAsRead}
                  />
                ))
              ) : (
                <div className="px-4 py-6 text-sm text-center text-gray-400">
                  No notifications
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="friends" className="space-y-2 p-2 m-0">
              {friendRequests.length > 0 ? (
                friendRequests.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onAccept={handleAcceptFriendRequest}
                    onDecline={handleDeclineFriendRequest}
                    onDelete={handleDeleteNotification}
                    onRead={handleMarkAsRead}
                  />
                ))
              ) : (
                <div className="px-4 py-6 text-sm text-center text-gray-400">
                  No friend requests
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="rooms" className="space-y-2 p-2 m-0">
              {roomInvitations.length > 0 ? (
                roomInvitations.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onJoin={handleJoinRoom}
                    onDecline={handleDeleteNotification}
                    onDelete={handleDeleteNotification}
                    onRead={handleMarkAsRead}
                  />
                ))
              ) : (
                <div className="px-4 py-6 text-sm text-center text-gray-400">
                  No room invitations
                </div>
              )}
            </TabsContent>
          </div>
        </Tabs>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}