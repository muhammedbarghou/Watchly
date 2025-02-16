import { useEffect, useCallback, useRef } from 'react';
import { WSMessage } from '@/types/room';

export const useWebSocket = (url: string, onMessage: (msg: WSMessage) => void) => {
  const wsRef = useRef<WebSocket | null>(null);

  const sendMessage = useCallback((message: WSMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  }, []);

  useEffect(() => {
    wsRef.current = new WebSocket(url);

    wsRef.current.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data) as WSMessage;
        onMessage(message);
      } catch (error) {
        console.error('Invalid WS message:', error);
      }
    };

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [url, onMessage]);

  return { sendMessage };
};