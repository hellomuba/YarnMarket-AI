import React from 'react';
import { WebSocketConnectionStatus } from '../types';
import { Wifi, WifiOff, RotateCcw, AlertTriangle } from 'lucide-react';

interface WebSocketStatusProps {
  connectionStatus: WebSocketConnectionStatus;
  error?: string | null;
  onReconnect?: () => void;
  className?: string;
  showText?: boolean;
}

export const WebSocketStatus: React.FC<WebSocketStatusProps> = ({
  connectionStatus,
  error,
  onReconnect,
  className = '',
  showText = true,
}) => {
  const getStatusConfig = () => {
    switch (connectionStatus) {
      case 'Open':
        return {
          icon: Wifi,
          color: 'text-green-500',
          bg: 'bg-green-100',
          text: 'Connected',
          description: 'Real-time updates active',
        };
      case 'Connecting':
        return {
          icon: RotateCcw,
          color: 'text-yellow-500',
          bg: 'bg-yellow-100',
          text: 'Connecting',
          description: 'Establishing connection...',
          animate: 'animate-spin',
        };
      case 'Closed':
      default:
        return {
          icon: error ? AlertTriangle : WifiOff,
          color: error ? 'text-red-500' : 'text-gray-500',
          bg: error ? 'bg-red-100' : 'bg-gray-100',
          text: error ? 'Error' : 'Disconnected',
          description: error || 'Real-time updates disabled',
        };
    }
  };

  const config = getStatusConfig();
  const IconComponent = config.icon;

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* Status Icon */}
      <div className={`p-1.5 rounded-full ${config.bg}`}>
        <IconComponent 
          size={16} 
          className={`${config.color} ${config.animate || ''}`}
        />
      </div>

      {/* Status Text */}
      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center space-x-2">
            <span className={`text-sm font-medium ${config.color}`}>
              {config.text}
            </span>
            
            {/* Reconnect Button */}
            {connectionStatus === 'Closed' && onReconnect && (
              <button
                onClick={onReconnect}
                className="text-xs text-blue-600 hover:text-blue-800 underline"
                title="Try to reconnect"
              >
                Retry
              </button>
            )}
          </div>
          
          <span className="text-xs text-gray-500">
            {config.description}
          </span>
          
          {/* Error Message */}
          {error && (
            <span className="text-xs text-red-600 max-w-xs truncate" title={error}>
              {error}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default WebSocketStatus;
