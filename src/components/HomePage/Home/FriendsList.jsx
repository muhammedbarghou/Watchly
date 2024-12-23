import React, { useEffect, useState } from 'react';
import { FriendshipService } from '../../../services/FriendshipService';

export const FriendsList = ({ currentUser }) => {
    const [friends, setFriends] = useState([]);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchFriends();
        fetchPendingRequests();
    }, []);

    const fetchFriends = async () => {
        try {
            const friendsList = await FriendshipService.listFriends(currentUser.uid);
            setFriends(friendsList);
        } catch (err) {
            setError(err.message);
        }
    };

    const fetchPendingRequests = async () => {
        try {
            const requests = await FriendshipService.listPendingRequests(currentUser.uid);
            setPendingRequests(requests);
        } catch (err) {
            setError(err.message);
        }
    };

    const sendRequest = async (friendUserId) => {
        try {
            await FriendshipService.sendFriendRequest(currentUser.uid, friendUserId);
            alert('Friend request sent!');
            fetchPendingRequests();
        } catch (err) {
            setError(err.message);
        }
    };

    const acceptRequest = async (friendUserId) => {
        try {
            await FriendshipService.acceptFriendRequest(currentUser.uid, friendUserId);
            alert('Friend request accepted!');
            fetchFriends();
            fetchPendingRequests();
        } catch (err) {
            setError(err.message);
        }
    };

    const rejectRequest = async (friendUserId) => {
        try {
            await FriendshipService.rejectFriendRequest(currentUser.uid, friendUserId);
            alert('Friend request rejected!');
            fetchPendingRequests();
        } catch (err) {
            setError(err.message);
        }
    };

    return <div className="max-w-2xl mx-auto px-4">

    </div>
};