import WebSocket, { WebSocketServer } from 'ws';
import { Room, User, WSMessage } from '../src/types/room';

const wss = new WebSocketServer({ port: 8080 });
const rooms = new Map<string, Set<WebSocket>>();
const users = new Map<string, string>();

wss.on('connection', (ws) => {
  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString()) as WSMessage;
      
      switch (message.type) {
        case 'JOIN':
          handleJoin(message.roomId, message.userId, ws);
          break;
          
        case 'STATE':
          broadcastState(message.roomId, message.state, ws);
          break;
      }
    } catch (error) {
      console.error('Error processing message:', error);
    }
  });

  ws.on('close', () => {
    const userId = users.get(ws.url);
    if (userId) {
      broadcastUserLeft(userId);
      users.delete(ws.url);
    }
  });
});

function handleJoin(roomId: string, userId: string, ws: WebSocket) {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, new Set());
  }
  
  rooms.get(roomId)?.add(ws);
  users.set(ws.url, userId);
  
  broadcastUserJoined(roomId, { id: userId, roomId, name: `User${Math.random().toString(36).substr(2, 5)}`, lastActive: Date.now() });
}

function broadcastState(roomId: string, state: Partial<Room>, sender: WebSocket) {
  rooms.get(roomId)?.forEach(client => {
    if (client !== sender && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type: 'STATE', roomId, state }));
    }
  });
}

function broadcastUserJoined(roomId: string, user: User) {
  const message: WSMessage = { type: 'USER_JOINED', user };
  broadcastToRoom(roomId, message);
}

function broadcastUserLeft(userId: string) {
  const message: WSMessage = { type: 'USER_LEFT', userId };
  broadcastToAll(message);
}

function broadcastToRoom(roomId: string, message: WSMessage) {
  rooms.get(roomId)?.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
}

function broadcastToAll(message: WSMessage) {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
}