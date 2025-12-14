'use client';

import { useState } from 'react';
import { Bell, Search, ChevronDown, User, LogOut, Settings as SettingsIcon } from 'lucide-react';
import { Merchant } from '@/types';
import ThemeToggle from './ThemeToggle';
import ConnectionStatus from './ConnectionStatus';

interface HeaderProps {
  selectedMerchant: Merchant | null;
  onMerchantSelect: (merchant: Merchant | null) => void;
}

export default function Header({ selectedMerchant, onMerchantSelect }: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAdminMenu, setShowAdminMenu] = useState(false);

  const mockNotifications = [
    { id: 1, title: 'New merchant registered', message: 'Tech Electronics just signed up', time: '5 min ago' },
    { id: 2, title: 'High message volume', message: 'Processing 150+ messages/hour', time: '1 hour ago' },
    { id: 3, title: 'System update', message: 'Dashboard updated to v1.0.0', time: '2 hours ago' },
  ];

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
  };

  const handleAdminClick = () => {
    setShowAdminMenu(!showAdminMenu);
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
          <ConnectionStatus />

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Notifications */}
          <div className="relative">
            <button 
              onClick={handleNotificationClick}
              className="relative p-2 text-slate-400 hover:text-white transition-colors"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            </button>
            
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-slate-800 border border-slate-700 rounded-lg shadow-lg z-50">
                <div className="p-4 border-b border-slate-700">
                  <h3 className="text-white font-semibold">Notifications</h3>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {mockNotifications.map((notif) => (
                    <div key={notif.id} className="p-4 border-b border-slate-700 last:border-0 hover:bg-slate-700/50">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-white text-sm font-medium">{notif.title}</p>
                          <p className="text-slate-400 text-sm">{notif.message}</p>
                        </div>
                        <span className="text-slate-500 text-xs">{notif.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-4 border-t border-slate-700">
                  <button className="text-green-400 text-sm hover:text-green-300">View all notifications</button>
                </div>
              </div>
            )}
          </div>

          {/* User Avatar */}
          <div className="relative">
            <button 
              onClick={handleAdminClick}
              className="flex items-center space-x-2 p-2 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">A</span>
              </div>
              <span className="text-slate-300 text-sm">Admin</span>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>
            
            {showAdminMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-lg z-50">
                <div className="p-2">
                  <button className="w-full flex items-center space-x-2 px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-md transition-colors">
                    <User className="w-4 h-4" />
                    <span className="text-sm">Profile</span>
                  </button>
                  <button className="w-full flex items-center space-x-2 px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-md transition-colors">
                    <SettingsIcon className="w-4 h-4" />
                    <span className="text-sm">Settings</span>
                  </button>
                  <hr className="my-2 border-slate-700" />
                  <button className="w-full flex items-center space-x-2 px-3 py-2 text-red-400 hover:text-red-300 hover:bg-slate-700 rounded-md transition-colors">
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm">Sign out</span>
                  </button>
                </div>
              </div>
            )}
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
