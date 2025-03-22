import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { 
  collection, 
  doc, 
  getDoc, 
  query, 
  where, 
  updateDoc, 
  onSnapshot, 
  addDoc,
  orderBy, 
  serverTimestamp,
  deleteDoc,
  getDocs
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/use-auth';
import SimpleChatSidebar from '@/components/chat/ChatSideBar';
import SimpleChatSection from '@/components/chat/ChatSection';
import { toast } from 'sonner';
import { Loader2, ArrowLeft } from 'lucide-react';

// Simple interfaces to model our data
interface ChatMessage {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  senderPhoto?: string;
  timestamp: any;
}

interface ChatRoom {
  id: string;
  name: string;
  participants: {
    id: string;
    name: string;
    photo?: string;
  }[];
  lastMessage?: {
    text: string;
    timestamp: any;
  };
  removedBy?: string[]; // Track users who removed the chat
}

interface Friend {
  uid: string;
  name: string;
  photoURL: string | null;
  status: 'online' | 'offline';
  lastSeen?: string;
}

export function ChatPage() {
  const { currentUser } = useAuth();
  const [chats, setChats] = useState<ChatRoom[]>([]);
  const [selectedChat, setSelectedChat] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [isMobileView, setIsMobileView] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  
  // Check for mobile view on mount and window resize
  useEffect(() => {
    const checkMobileView = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    
    // Initial check
    checkMobileView();
    
    // Add resize listener
    window.addEventListener('resize', checkMobileView);
    
    // Clean up
    return () => window.removeEventListener('resize', checkMobileView);
  }, []);
  
  // Adjust sidebar visibility based on selection and view
  useEffect(() => {
    if (isMobileView && selectedChat) {
      setShowSidebar(false);
    } else if (!isMobileView) {
      setShowSidebar(true);
    }
  }, [selectedChat, isMobileView]);
  
  // Fetch user's chats
  useEffect(() => {
    if (!currentUser) return;
    
    const fetchChats = async () => {
      try {
        // Get chats where current user is a participant
        const chatsRef = collection(db, 'chats');
        const q = query(chatsRef, where('participantIds', 'array-contains', currentUser.uid));
        
        const unsubscribe = onSnapshot(q, async (snapshot) => {
          const chatsList: ChatRoom[] = [];
          
          // Process each chat document
          for (const chatDoc of snapshot.docs) {
            const chatData = chatDoc.data();
            
            // Skip chats that the current user has removed
            const removedBy = chatData.removedBy || [];
            if (removedBy.includes(currentUser.uid)) {
              continue;
            }
            
            chatsList.push({
              id: chatDoc.id,
              name: chatData.isGroup ? chatData.name : (
                // For direct messages, use the other participant's name
                chatData.participants.find((p: any) => p.id !== currentUser.uid)?.name || 'Chat'
              ),
              participants: chatData.participants || [],
              lastMessage: chatData.lastMessage,
              removedBy: chatData.removedBy || []
            });
          }
          
          setChats(chatsList);
          setLoading(false);
          
          // If we have a selected chat but it's no longer in the list (e.g., it was deleted),
          // clear the selection
          if (selectedChat && !chatsList.some(chat => chat.id === selectedChat.id)) {
            setSelectedChat(null);
          }
        });
        
        return () => unsubscribe();
      } catch (error) {
        console.error('Error fetching chats:', error);
        setLoading(false);
      }
    };
    
    // Fetch friends for new chat creation - using your existing structure
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
                  uid: friend.uid,
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
    
    fetchChats();
    fetchFriends();
  }, [currentUser, selectedChat]);
  
  // Load messages when a chat is selected
  useEffect(() => {
    if (!selectedChat) {
      setMessages([]);
      return;
    }
    
    // Subscribe to messages for the selected chat
    const messagesRef = collection(db, 'chats', selectedChat.id, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesList: ChatMessage[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ChatMessage));
      
      setMessages(messagesList);
    });
    
    return () => unsubscribe();
  }, [selectedChat]);
  
  // Handle selecting a chat
  const handleSelectChat = (chat: ChatRoom) => {
    setSelectedChat(chat);
    if (isMobileView) {
      setShowSidebar(false);
    }
  };
  
  // Handle going back to chat list in mobile view
  const handleBackToList = () => {
    if (isMobileView) {
      setShowSidebar(true);
    }
  };
  
  // Send a message
  const handleSendMessage = async (text: string) => {
    if (!text.trim() || !currentUser || !selectedChat) return;
    
    try {
      // Add message to the messages subcollection
      await addDoc(collection(db, 'chats', selectedChat.id, 'messages'), {
        text: text.trim(),
        senderId: currentUser.uid,
        senderName: currentUser.displayName || 'User',
        senderPhoto: currentUser.photoURL,
        timestamp: serverTimestamp()
      });
      
      // Update the last message in the chat document
      await updateDoc(doc(db, 'chats', selectedChat.id), {
        lastMessage: {
          text: text.trim(),
          timestamp: serverTimestamp()
        }
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };
  
  // Create a new chat
  const handleCreateChat = async (participants: string[]) => {
    if (!currentUser || participants.length === 0) return;
    
    try {
      // Check if there's already a chat with these participants
      if (participants.length === 1) {
        const existingChat = chats.find(chat => 
          chat.participants.length === 2 &&
          chat.participants.some(p => p.id === participants[0])
        );
        
        if (existingChat) {
          setSelectedChat(existingChat);
          if (isMobileView) {
            setShowSidebar(false);
          }
          return;
        }
      }
      
      // Format participants for the chat document
      const participantDetails = await Promise.all(
        [...participants, currentUser.uid].map(async (userId) => {
          const userDoc = await getDoc(doc(db, 'users', userId));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            return {
              id: userId,
              name: userData.displayName || 'User',
              photo: userData.photoURL
            };
          }
          return {
            id: userId,
            name: 'User'
          };
        })
      );
      
      // Determine if it's a group chat
      const isGroup = participants.length > 1;
      
      // Create chat document
      const chatRef = await addDoc(collection(db, 'chats'), {
        name: isGroup ? 'Group Chat' : participantDetails.find(p => p.id !== currentUser.uid)?.name,
        isGroup,
        createdAt: serverTimestamp(),
        participantIds: [...participants, currentUser.uid],
        participants: participantDetails,
        removedBy: [] // Initialize empty array for tracking removals
      });
      
      // Add initial system message
      await addDoc(collection(db, 'chats', chatRef.id, 'messages'), {
        text: isGroup ? 'Group chat created' : 'Chat started',
        senderId: 'system',
        senderName: 'System',
        timestamp: serverTimestamp()
      });
      
      // Get the chat we just created
      const chatDoc = await getDoc(doc(db, 'chats', chatRef.id));
      if (chatDoc.exists()) {
        const newChat: ChatRoom = {
          id: chatRef.id,
          name: isGroup ? 'Group Chat' : participantDetails.find(p => p.id !== currentUser.uid)?.name || 'Chat',
          participants: participantDetails,
          removedBy: []
        };
        
        // Select the new chat
        setSelectedChat(newChat);
        if (isMobileView) {
          setShowSidebar(false);
        }
      }
      
      toast.success(isGroup ? 'Group chat created' : 'Chat started');
    } catch (error) {
      console.error('Error creating chat:', error);
      toast.error('Failed to create chat');
    }
  };
  
  // Delete a chat
  const handleDeleteChat = async (chatId: string) => {
    if (!currentUser) return;
    
    try {
      const chatRef = doc(db, 'chats', chatId);
      const chatDoc = await getDoc(chatRef);
      
      if (!chatDoc.exists()) {
        toast.error('Chat not found');
        return;
      }
      
      const chatData = chatDoc.data();
      const removedBy = chatData.removedBy || [];
      const otherParticipantIds = chatData.participantIds.filter((id: string) => id !== currentUser.uid);
      
      // Add current user to removedBy array
      await updateDoc(chatRef, {
        removedBy: [...removedBy, currentUser.uid]
      });
      
      // If all participants have removed the chat, delete it from the database
      if (removedBy.length + 1 >= chatData.participantIds.length) {
        // Delete all messages
        const messagesSnapshot = await getDocs(collection(db, 'chats', chatId, 'messages'));
        const deletePromises = messagesSnapshot.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(deletePromises);
        
        // Delete the chat document
        await deleteDoc(chatRef);
        
        console.log('Chat and messages permanently deleted');
      }
      
      // Clear selected chat if it was the one deleted
      if (selectedChat && selectedChat.id === chatId) {
        setSelectedChat(null);
        if (isMobileView) {
          setShowSidebar(true);
        }
      }
      
      toast.success('Conversation removed');
    } catch (error) {
      console.error('Error deleting chat:', error);
      toast.error('Failed to delete conversation');
    }
  };
  
  const handleMessageFriend = (friendId: string) => {
    handleCreateChat([friendId]);
  };
  
  if (!currentUser) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-[80vh]">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Please log in</h2>
            <p>You need to be logged in to access chat</p>
          </div>
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <div className="flex h-[calc(100vh-64px)] relative">
        {loading ? (
          <div className="flex items-center justify-center w-full">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            <span>Loading chats...</span>
          </div>
        ) : (
          <>
            {/* Sidebar - fullscreen on mobile when visible */}
            <div 
              className={`${
                isMobileView 
                  ? showSidebar 
                    ? 'fixed inset-0 z-20 bg-background' 
                    : 'hidden'
                  : 'w-80 border-r'
              } h-full`}
            >
              <SimpleChatSidebar 
                chats={chats}
                selectedChat={selectedChat}
                onSelectChat={handleSelectChat}
                friends={friends}
                onCreateChat={handleCreateChat}
                currentUserId={currentUser.uid}
              />
            </div>
            
            {/* Chat section */}
            <div 
              className={`${
                isMobileView 
                  ? !showSidebar 
                    ? 'fixed inset-0 z-20 bg-background' 
                    : 'hidden'
                  : 'flex-1'
              } h-full`}
            >
              {selectedChat && isMobileView && !showSidebar && (
                <button 
                  onClick={handleBackToList}
                  className="flex items-center p-2 text-sm font-medium"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Back to chats
                </button>
              )}
              <SimpleChatSection
                chat={selectedChat}
                messages={messages}
                onSendMessage={handleSendMessage}
                onDeleteChat={handleDeleteChat}
                currentUserId={currentUser.uid}
              />
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
}

export default ChatPage;