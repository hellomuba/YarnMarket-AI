import { useState, useEffect, useRef, useCallback } from 'react';
import { WebSocketConnectionStatus } from '../types';

interface UseWebSocketReturn {
  lastMessage: MessageEvent | null;
  connectionStatus: WebSocketConnectionStatus;
  sendMessage: (message: string) => void;
  reconnect: () => void;
  isConnected: boolean;
  error: string | null;
}

// Configuration from environment variables
const WS_CONFIG = {
  maxReconnectAttempts: parseInt(process.env.REACT_APP_WS_RECONNECT_ATTEMPTS || '5'),
  reconnectDelay: parseInt(process.env.REACT_APP_WS_RECONNECT_DELAY || '1000'),
  maxReconnectDelay: 30000,
  isDebug: process.env.REACT_APP_DEBUG === 'true',
};

export const useWebSocket = (url?: string): UseWebSocketReturn => {
  // Use environment variable if no URL provided
  const wsUrl = url || process.env.REACT_APP_WS_URL || 'ws://localhost:8005/ws';
  
  const [connectionStatus, setConnectionStatus] = useState<WebSocketConnectionStatus>('Closed');
  const [lastMessage, setLastMessage] = useState<MessageEvent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const reconnectAttemptsRef = useRef(0);
  const isManualClose = useRef(false);

  const connect = useCallback(() => {
    // Clear any previous errors
    setError(null);
    setConnectionStatus('Connecting');
    isManualClose.current = false;
    
    try {
      if (WS_CONFIG.isDebug) {
        console.log(`🔌 Attempting to connect to WebSocket: ${wsUrl}`);
      }
      
      // Close existing connection if any
      if (ws.current && ws.current.readyState !== WebSocket.CLOSED) {
        ws.current.close();
      }
      
      ws.current = new WebSocket(wsUrl);
      
      ws.current.onopen = () => {
        if (WS_CONFIG.isDebug) {
          console.log('✅ WebSocket connected successfully');
        }
        setConnectionStatus('Open');
        setError(null);
        reconnectAttemptsRef.current = 0;
      };
      
      ws.current.onmessage = (event) => {
        setLastMessage(event);
        
        // Log WebSocket messages for debugging
        if (WS_CONFIG.isDebug) {
          try {
            const data = JSON.parse(event.data);
            console.log('📨 WebSocket message received:', data);
          } catch (e) {
            console.log('📨 WebSocket raw message:', event.data);
          }
        }
      };
      
      ws.current.onclose = (event) => {
        const { code, reason, wasClean } = event;
        
        if (WS_CONFIG.isDebug) {
          console.log(`🔌 WebSocket closed: Code ${code}, Reason: "${reason}", Clean: ${wasClean}`);
        }
        
        setConnectionStatus('Closed');
        
        // Don't reconnect if it was a manual close
        if (isManualClose.current) {
          return;
        }
        
        // Handle different close codes
        let errorMessage = '';
        switch (code) {
          case 1000:
            // Normal closure
            return;
          case 1006:
            errorMessage = 'Connection closed abnormally. Server may be unavailable.';
            break;
          case 1002:
            errorMessage = 'WebSocket protocol error.';
            break;
          case 1003:
            errorMessage = 'Unsupported data type.';
            break;
          default:
            errorMessage = reason || `Connection closed with code ${code}`;
        }
        
        setError(errorMessage);
        
        // Attempt to reconnect with exponential backoff
        if (reconnectAttemptsRef.current < WS_CONFIG.maxReconnectAttempts) {
          const delay = Math.min(
            WS_CONFIG.reconnectDelay * Math.pow(2, reconnectAttemptsRef.current),
            WS_CONFIG.maxReconnectDelay
          );
          
          if (WS_CONFIG.isDebug) {
            console.log(
              `🔄 Attempting to reconnect in ${delay}ms (attempt ${reconnectAttemptsRef.current + 1}/${WS_CONFIG.maxReconnectAttempts})`
            );
          }
          
          setConnectionStatus('Connecting');
          
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current++;
            connect();
          }, delay);
        } else {
          const finalError = `Max reconnection attempts (${WS_CONFIG.maxReconnectAttempts}) reached. Please check if the WebSocket server is running.`;
          console.error('❌', finalError);
          setError(finalError);
        }
      };
      
      ws.current.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        const errorMessage = 'WebSocket connection error. Please check if the server is running.';
        setError(errorMessage);
        setConnectionStatus('Closed');
      };
      
    } catch (error) {
      const errorMessage = `Failed to create WebSocket connection: ${error instanceof Error ? error.message : 'Unknown error'}`;
      console.error('❌', errorMessage);
      setError(errorMessage);
      setConnectionStatus('Closed');
    }
  }, [wsUrl]);

  const reconnect = useCallback(() => {
    if (WS_CONFIG.isDebug) {
      console.log('🔄 Manual reconnection initiated');
    }
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    if (ws.current) {
      isManualClose.current = true;
      ws.current.close();
    }
    
    reconnectAttemptsRef.current = 0;
    setTimeout(() => connect(), 100); // Small delay to ensure cleanup
  }, [connect]);

  const sendMessage = useCallback((message: string) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      if (WS_CONFIG.isDebug) {
        console.log('📤 Sending WebSocket message:', message);
      }
      ws.current.send(message);
      return true;
    } else {
      console.warn('❌ Cannot send message: WebSocket is not connected (status:', connectionStatus, ')');
      return false;
    }
  }, [connectionStatus]);

  useEffect(() => {
    connect();

    return () => {
      if (WS_CONFIG.isDebug) {
        console.log('🧹 Cleaning up WebSocket connection');
      }
      
      isManualClose.current = true;
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [connect]);

  const isConnected = connectionStatus === 'Open';

  return {
    lastMessage,
    connectionStatus,
    sendMessage,
    reconnect,
    isConnected,
    error,
  };
};
