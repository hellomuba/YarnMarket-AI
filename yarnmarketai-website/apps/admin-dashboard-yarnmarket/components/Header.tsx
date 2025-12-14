'use client';

import { Bell, Search, Wifi, WifiOff, Loader } from 'lucide-react';
import { ConnectionStatus, Merchant } from '@/types';

interface HeaderProps {
  selectedMerchant: Merchant | null;
  connectionStatus: ConnectionStatus;
  onMerchantSelect: (merchant: Merchant | null) => void;
}

export default function Header({ selectedMerchant, connectionStatus, onMerchantSelect }: HeaderProps) {
  const getConnectionIcon = () => {
    switch (connectionStatus) {
      case 'Open':
        return <Wifi className="w-4 h-4 text-green-400" />;
      case 'Connecting':
        return <Loader className="w-4 h-4 text-yellow-400 animate-spin" />;
      case 'Closed':
      case 'Error':
      default:
        return <WifiOff className="w-4 h-4 text-red-400" />;
    }
  };

  const getConnectionText = () => {
    switch (connectionStatus) {
      case 'Open':
        return 'Connected';
      case 'Connecting':
        return 'Connecting...';
      case 'Closed':
        return 'Disconnected';
      case 'Error':
        return 'Connection Error';
      default:
        return 'Unknown';
    }
  };

  return (
    <header className="bg-slate-950 border-b border-slate-800 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left section */}
        <div className="flex items-center space-x-4">
          <div>
            <h2 className="text-xl font-semibold text-white">
              {selectedMerchant ? selectedMerchant.business_name : 'YarnMarket AI Dashboard'}
            </h2>
            <p className="text-sm text-slate-400">
              {selectedMerchant ? 'Merchant Dashboard' : 'Multi-Tenant Admin Panel'}
            </p>
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search merchants, messages..."
              className="bg-slate-800 text-white placeholder-slate-400 pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 w-64"
            />
          </div>

          {/* Connection Status */}
          <div className="flex items-center space-x-2 px-3 py-2 bg-slate-800 rounded-lg">
            {getConnectionIcon()}
            <span className="text-sm text-slate-300">{getConnectionText()}</span>
          </div>

          {/* Notifications */}
          <button className="relative p-2 text-slate-400 hover:text-white transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
          </button>

          {/* User Avatar */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">A</span>
            </div>
            <span className="text-slate-300 text-sm">Admin</span>
          </div>
        </div>
      </div>

      {/* Quick Stats Bar */}
      {selectedMerchant && (
        <div className="mt-4 flex items-center space-x-6 text-sm">
          <div className="flex items-center space-x-2">
            <span className="text-slate-400">Messages:</span>
            <span className="text-white font-medium">{selectedMerchant.total_messages}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-slate-400">Active Conversations:</span>
            <span className="text-white font-medium">{selectedMerchant.active_conversations}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-slate-400">Status:</span>
            <span className={`px-2 py-1 rounded-full text-xs ${
              selectedMerchant.status === 'active' 
                ? 'bg-green-600/20 text-green-400' 
                : 'bg-slate-600/20 text-slate-400'
            }`}>
              {selectedMerchant.status.toUpperCase()}
            </span>
          </div>
          {selectedMerchant.last_message_at && (
            <div className="flex items-center space-x-2">
              <span className="text-slate-400">Last Activity:</span>
              <span className="text-white font-medium">
                {new Date(selectedMerchant.last_message_at).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
