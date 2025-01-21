export interface Message {
    id: number;
    sender: string;
    content: string;
    time: string;
    timestamp: number;
}

export interface Chat {
    id: string;
    name: string;
    members?: string[];
    messages: Message[];
    lastMessage?: Message;
    unreadCount?: number;
}
