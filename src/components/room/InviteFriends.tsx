import  { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useNotifications } from '@/hooks/use-notifications';
import { useFriends } from '@/hooks/use-friends';
import { UserPlus, Loader2, CheckCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

interface InviteFriendsProps {
  roomId: string;
  roomName: string;
  documentId: string;
}

export function InviteFriends({ roomId, roomName, documentId }: InviteFriendsProps) {
  const [open, setOpen] = useState(false);
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [invitedFriends, setInvitedFriends] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  
  const { friends } = useFriends();
  const { sendRoomInvitation } = useNotifications();
  
  // Toggle friend selection
  const toggleFriend = (friendId: string) => {
    if (selectedFriends.includes(friendId)) {
      setSelectedFriends(prev => prev.filter(id => id !== friendId));
    } else {
      setSelectedFriends(prev => [...prev, friendId]);
    }
  };
  
  // Send invitations to selected friends
  const handleInvite = async () => {
    if (selectedFriends.length === 0) {
      toast.error('Please select at least one friend to invite');
      return;
    }
    
    setLoading(true);
    
    try {
      // Send invitations to each selected friend
      const invitePromises = selectedFriends.map(friendId => 
        sendRoomInvitation(friendId, roomId, roomName, documentId)
      );
      
      await Promise.all(invitePromises);
      
      // Update invited friends list
      setInvitedFriends(prev => [...prev, ...selectedFriends]);
      setSelectedFriends([]);
      
      toast.success(
        selectedFriends.length === 1 
          ? 'Invitation sent to 1 friend' 
          : `Invitations sent to ${selectedFriends.length} friends`
      );
    } catch (error) {
      console.error('Error sending invitations:', error);
      toast.error('Failed to send invitations');
    } finally {
      setLoading(false);
    }
  };
  
  // Filter out friends who are already invited
  const availableFriends = friends.filter(friend => !invitedFriends.includes(friend.id));
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1">
          <UserPlus className="w-4 h-4" />
          Invite Friends
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite Friends to Join</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Select friends to invite to "{roomName}"
          </p>
          
          {availableFriends.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              No friends available to invite
            </div>
          ) : (
            <ScrollArea className="h-72">
              <div className="space-y-2">
                {availableFriends.map(friend => {
                  const isSelected = selectedFriends.includes(friend.id);
                  const isInvited = invitedFriends.includes(friend.id);
                  
                  return (
                    <div
                      key={friend.id}
                      className={`flex items-center justify-between p-3 rounded-md cursor-pointer transition-colors ${
                        isSelected 
                          ? 'bg-primary/10 border border-primary'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                      onClick={() => toggleFriend(friend.id)}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={friend.photoURL || undefined} alt={friend.displayName} />
                          <AvatarFallback>
                            {friend.displayName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{friend.displayName}</p>
                          <p className="text-xs text-gray-500">
                            {friend.status === 'online' ? 'Online' : 'Offline'}
                          </p>
                        </div>
                      </div>
                      
                      <div>
                        {isInvited ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <div className={`w-5 h-5 rounded-full border-2 ${
                            isSelected ? 'border-primary bg-primary' : 'border-gray-300 dark:border-gray-600'
                          }`}>
                            {isSelected && (
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-4 h-4">
                                // src/components/room/InviteFriends.tsx (continued)
                                <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </div>
        
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleInvite} 
            disabled={loading || selectedFriends.length === 0}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4 mr-2" />
                Invite {selectedFriends.length > 0 ? `(${selectedFriends.length})` : ''}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}