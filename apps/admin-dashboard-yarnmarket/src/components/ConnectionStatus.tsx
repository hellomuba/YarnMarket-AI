'use client';

import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, AlertTriangle } from 'lucide-react';

interface ConnectionStatusProps {
  className?: string;
}

type Status = 'connected' | 'disconnected' | 'connecting';

export default function ConnectionStatus({ className = '' }: ConnectionStatusProps) {
  const [status, setStatus] = useState<Status>('connecting');
  const [lastChecked, setLastChecked] = useState<Date>(new Date());

  useEffect(() => {
    const checkConnection = async () => {
      try {
        // Check if we can reach the API
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);

        // Use mock API check if enabled, otherwise try real API
        const useMockAPI = process.env.NEXT_PUBLIC_USE_MOCK_API === 'true';
        
        if (useMockAPI) {
          // If using mock API, always show connected
          setStatus('connected');
        } else {
          // Try to reach the real API
          const response = await fetch('/api/health', {
            signal: controller.signal,
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          clearTimeout(timeoutId);
          
          if (response.ok) {
            setStatus('connected');
          } else {
            setStatus('disconnected');
          }
        }
        
        setLastChecked(new Date());
      } catch (error) {
        setStatus('disconnected');
        setLastChecked(new Date());
      }
    };

    // Initial check
    checkConnection();

    // Set up periodic checks
    const interval = setInterval(checkConnection, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const getStatusConfig = () => {
    switch (status) {
      case 'connected':
        return {
          icon: <Wifi className="h-4 w-4" />,
          text: 'Connected',
          color: 'text-green-400',
          bgColor: 'bg-green-600/20',
          borderColor: 'border-green-600/30'
        };
      case 'disconnected':
        return {
          icon: <WifiOff className="h-4 w-4" />,
          text: 'Disconnected',
          color: 'text-red-400',
          bgColor: 'bg-red-600/20',
          borderColor: 'border-red-600/30'
        };
      case 'connecting':
        return {
          icon: <AlertTriangle className="h-4 w-4 animate-pulse" />,
          text: 'Connecting...',
          color: 'text-yellow-400',
          bgColor: 'bg-yellow-600/20',
          borderColor: 'border-yellow-600/30'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${config.bgColor} ${config.color} ${config.borderColor} ${className}`}>
      {config.icon}
      <span className="ml-1">{config.text}</span>
      {process.env.NODE_ENV === 'development' && (
        <span className="ml-2 text-xs opacity-60">
          {process.env.NEXT_PUBLIC_USE_MOCK_API === 'true' ? 'Mock' : 'Live'}
        </span>
      )}
    </div>
  );
}