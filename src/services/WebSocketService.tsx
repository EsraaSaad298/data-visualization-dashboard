// src/services/WebSocketService.tsx
import { useState, useEffect, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

export interface DataPacket {
  id: string;
  name: string;
  value: number;
  category: 'Sensor' | 'System' | 'Event';
  status: 'active' | 'idle' | 'critical';
  x: number;
  y: number;
  timestamp: number;
}

export const useWebSocketService = (url: string) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [dataStream, setDataStream] = useState<DataPacket[]>([]);

  // Send custom structured mock data every 3 seconds
  useEffect(() => {
    const ws = new WebSocket(url);
    setSocket(ws);

    ws.onopen = () => {
      setIsConnected(true);
      console.log('[WS] Connected to echo server');

      const interval = setInterval(() => {
        const payload: DataPacket = {
          id: `node-${Date.now()}`,
          name: `Device-${Math.floor(Math.random() * 1000)}`,
          value: Math.random() * 100,
          category: ['Sensor', 'System', 'Event'][Math.floor(Math.random() * 3)] as any,
          status: ['active', 'idle', 'critical'][Math.floor(Math.random() * 3)] as any,
          x: Math.random() * 1000 * 0.8 + 100, 
          y: Math.random() * 700 * 0.8 + 50,
          timestamp: Date.now(),
        };

        ws.send(JSON.stringify(payload));
      }, 3000);

      return () => clearInterval(interval);
    };

    ws.onmessage = (event) => {
      try {
        const parsed: DataPacket = JSON.parse(event.data);
        setDataStream(prev => [...prev, parsed].slice(-1000));
      } catch (e) {
        console.error('[WS] Failed to parse message', event.data);
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      console.log('[WS] Disconnected');
    };

    return () => {
      ws.close();
    };
  }, [url]);

  return {
    isConnected,
    dataStream,
    socket,
  };
};
