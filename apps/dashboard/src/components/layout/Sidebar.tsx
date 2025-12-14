import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  BarChart3, 
  Users, 
  MessageSquare, 
  MessageCircle, 
  Settings, 
  Database,
  Activity,
  Layers,
  Menu,
  X
} from 'lucide-react';
import { SidebarProps } from '../../types';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
  { name: 'Merchants', href: '/merchants', icon: Users },
  { name: 'Messages', href: '/messages', icon: MessageSquare },
  { name: 'Conversations', href: '/conversations', icon: MessageCircle },
  { name: 'Message Queues', href: '/queues', icon: Database },
  { name: 'System Status', href: '/system', icon: Activity },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export const Sidebar: React.FC<SidebarProps> = ({ 
  collapsed, 
  onToggle, 
  selectedMerchant, 
  onMerchantSelect 
}) => {
  return (
    <div className={`flex flex-col transition-all duration-300 ${
      collapsed ? 'w-16' : 'w-64'
    } bg-gray-900`}>
      <div className="flex items-center justify-between h-16 px-4 bg-gray-800">
        <div className="flex items-center">
          <Layers className="h-8 w-8 text-green-400" />
          {!collapsed && (
            <span className="ml-2 text-white font-semibold">YarnMarket AI</span>
          )}
        </div>
        <button
          onClick={onToggle}
          className="p-1 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-green-500 rounded"
        >
          {collapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
        </button>
      </div>
      
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`
              }
              title={collapsed ? item.name : ''}
            >
              <Icon className={`h-5 w-5 flex-shrink-0 ${
                collapsed ? '' : 'mr-3'
              }`} />
              {!collapsed && item.name}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-800">
        {selectedMerchant && !collapsed && (
          <div className="mb-4">
            <div className="text-xs text-gray-400 mb-2">Selected Merchant</div>
            <div className="bg-gray-800 rounded p-2">
              <div className="text-sm font-medium text-white truncate">
                {selectedMerchant.business_name}
              </div>
              <button
                onClick={() => onMerchantSelect(null)}
                className="text-xs text-gray-400 hover:text-white mt-1"
              >
                Clear selection
              </button>
            </div>
          </div>
        )}
        
        {!collapsed && (
          <>
            <div className="text-xs text-gray-400 mb-2">System Health</div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-gray-300">All systems operational</span>
            </div>
          </>
        )}
        
        {collapsed && (
          <div className="flex justify-center">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" title="System Health: Operational"></div>
          </div>
        )}
      </div>
    </div>
  );
};
