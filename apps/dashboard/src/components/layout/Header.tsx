import React from 'react';
import { Bell, Search, User, Wifi, WifiOff, Activity } from 'lucide-react';
import { WebSocketConnectionStatus, Merchant } from '../../types';

interface HeaderProps {
  selectedMerchant: Merchant | null;
  connectionStatus: WebSocketConnectionStatus;
  onMerchantSelect: (merchant: Merchant | null) => void;
}

export const Header: React.FC<HeaderProps> = ({ selectedMerchant, connectionStatus, onMerchantSelect }) => {
  const getConnectionIcon = () => {
    switch (connectionStatus) {
      case 'Open':
        return <Wifi className="h-4 w-4 text-green-500" />;
      case 'Connecting':
        return <Activity className="h-4 w-4 text-yellow-500 animate-pulse" />;
      default:
        return <WifiOff className="h-4 w-4 text-red-500" />;
    }
  };

  const getConnectionText = () => {
    switch (connectionStatus) {
      case 'Open':
        return 'Connected';
      case 'Connecting':
        return 'Connecting...';
      default:
        return 'Disconnected';
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
<div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900">
                YarnMarket AI Dashboard
              </h1>
              
              {/* Selected Merchant */}
              {selectedMerchant && (
                <div className="flex items-center space-x-2 px-3 py-1 bg-gray-100 rounded-lg">
                  <span className="text-sm text-gray-600">Viewing:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {selectedMerchant.business_name}
                  </span>
                  <button
                    onClick={() => onMerchantSelect(null)}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
            
            {/* Connection Status */}
            <div className="flex items-center space-x-2">
              {getConnectionIcon()}
              <span className={`text-sm ${
                connectionStatus === 'Open' 
                  ? 'text-green-600' 
                  : connectionStatus === 'Connecting' 
                    ? 'text-yellow-600' 
                    : 'text-red-600'
              }`}>
                {getConnectionText()}
              </span>
              {connectionStatus === 'Closed' && (
                <button
                  onClick={() => window.location.reload()}
                  className="text-xs text-blue-600 hover:text-blue-800 underline"
                >
                  Retry
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search merchants, conversations..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent w-64"
              />
            </div>

            {/* Notifications */}
            <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
            </button>

            {/* User Menu */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm text-gray-700">Admin</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
