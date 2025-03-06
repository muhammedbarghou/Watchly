import { useState, useEffect } from 'react';
import { MainLayout } from '../components/layout/MainLayout';
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
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/use-auth';
import SimpleChatSidebar from '@/components/chat/ChatSideBar';
import SimpleChatSection from '@/components/chat/ChatSection';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

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
            
            chatsList.push({
              id: chatDoc.id,
              name: chatData.isGroup ? chatData.name : (
                // For direct messages, use the other participant's name
                chatData.participants.find((p: any) => p.id !== currentUser.uid)?.name || 'Chat'
              ),
              participants: chatData.participants || [],
              lastMessage: chatData.lastMessage
            });
          }
          
          setChats(chatsList);
          setLoading(false);
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
  }, [currentUser]);
  
  // Load messages when a chat is selected
  useEffect(() => {
    if (!selectedChat) return;
    
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
        participants: participantDetails
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
          participants: participantDetails
        };
        
        // Select the new chat
        setSelectedChat(newChat);
      }
      
      toast.success(isGroup ? 'Group chat created' : 'Chat started');
    } catch (error) {
      console.error('Error creating chat:', error);
      toast.error('Failed to create chat');
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
      <div className="flex h-[calc(100vh-64px)]">
        {loading ? (
          <div className="flex items-center justify-center w-full">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            <span>Loading chats...</span>
          </div>
        ) : (
          <>
            <div className="w-80 border-r h-full">
              <SimpleChatSidebar 
                chats={chats}
                selectedChat={selectedChat}
                onSelectChat={handleSelectChat}
                friends={friends}
                onCreateChat={handleCreateChat}
                currentUserId={currentUser.uid}
              />
            </div>
            <div className="flex-1 h-full">
              <SimpleChatSection
                chat={selectedChat}
                messages={messages}
                onSendMessage={handleSendMessage}
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