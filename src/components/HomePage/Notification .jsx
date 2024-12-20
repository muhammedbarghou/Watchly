import React, { useReducer, useState } from "react";
import { Bell } from 'lucide-react';

const notificationReducer = (state, action) => {
    switch (action.type) {
        case 'MARK_ALL_READ':
            return state.map(notif => ({ ...notif, read: true }));
        case 'MARK_AS_READ':
            return state.map(notif => 
                notif.id === action.payload ? { ...notif, read: true } : notif
            );
        case 'ADD_NOTIFICATION':
            return [...state, action.payload];
        case 'REMOVE_NOTIFICATION':
            return state.filter(notif => notif.id !== action.payload);
        default:
            return state;
    }
};

function Notification() {
    

    return (
        <div className="relative">
        </div>
    );
}

export default Notification;
