// WebSocket Hook for Real-time Updates

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { ConnectionStatus, WebSocketMessage } from '@/types';

interface UseWebSocketReturn {
  lastMessage: WebSocketMessage | null;
  connectionStatus: ConnectionStatus;
  sendMessage: (message: any) => void;
  disconnect: () => void;
  connect: () => void;
}

export function useWebSocket(url: string): UseWebSocketReturn {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('Connecting');
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 10;

  const connect = useCallback(() => {
    // Skip WebSocket connection if using mock API
    if (process.env.NEXT_PUBLIC_USE_MOCK_API === 'true') {
      setConnectionStatus('Closed');
      return;
    }
    
    try {
      ws.current = new WebSocket(url);
      setConnectionStatus('Connecting');

      ws.current.onopen = () => {
        console.log('WebSocket connected');
        setConnectionStatus('Open');
        reconnectAttempts.current = 0;
      };

      ws.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          setLastMessage(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      ws.current.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason);
        setConnectionStatus('Closed');
        
        // Attempt to reconnect if not closed intentionally
        if (event.code !== 1000 && reconnectAttempts.current < maxReconnectAttempts) {
          const timeout = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
          console.log(`Attempting to reconnect in ${timeout}ms... (attempt ${reconnectAttempts.current + 1})`);
          
          reconnectTimeout.current = setTimeout(() => {
            reconnectAttempts.current++;
            connect();
          }, timeout);
        }
      };

      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionStatus('Error');
      };

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      setConnectionStatus('Error');
    }
  }, [url]);

  const disconnect = useCallback(() => {
    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current);
      reconnectTimeout.current = null;
    }
    if (ws.current) {
      ws.current.close(1000, 'User disconnected');
    }
  }, []);

  const sendMessage = useCallback((message: any) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not connected. Cannot send message:', message);
    }
  }, []);

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    lastMessage,
    connectionStatus,
    sendMessage,
    disconnect,
    connect
  };
}
