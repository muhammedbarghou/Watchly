import { db } from '../firebase';
import { doc, collection, setDoc, getDocs, updateDoc, query, where, deleteDoc, serverTimestamp } from 'firebase/firestore';

const friendshipsCollection = collection(db, 'friendships');

export const FriendshipService = {
    sendFriendRequest: async (currentUserId, friendUserId) => {
        const friendshipRef = doc(friendshipsCollection, `${currentUserId}_${friendUserId}`);
        await setDoc(friendshipRef, {
            userId1: currentUserId,
            userId2: friendUserId,
            status: 'pending',
            createdAt: serverTimestamp(),
        });
        console.log('Friend request sent!');
    },

    acceptFriendRequest: async (currentUserId, friendUserId) => {
        const friendshipRef = doc(friendshipsCollection, `${friendUserId}_${currentUserId}`);
        await updateDoc(friendshipRef, {
            status: 'accepted',
            updatedAt: serverTimestamp(),
        });
        console.log('Friend request accepted!');
    },

    rejectFriendRequest: async (currentUserId, friendUserId) => {
        const friendshipRef = doc(friendshipsCollection, `${friendUserId}_${currentUserId}`);
        await deleteDoc(friendshipRef);
        console.log('Friend request rejected or canceled!');
    },

    listFriends: async (currentUserId) => {
        const q = query(friendshipsCollection, where('status', '==', 'accepted'), where('userId1', '==', currentUserId));
        const querySnapshot = await getDocs(q);
        const friends = querySnapshot.docs.map((doc) => {
            const friendship = doc.data();
            return friendship.userId1 === currentUserId ? friendship.userId2 : friendship.userId1;
        });
        return friends;
    },

    listPendingRequests: async (currentUserId) => {
        const q = query(friendshipsCollection, where('userId2', '==', currentUserId), where('status', '==', 'pending'));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map((doc) => doc.data());
    },
};
