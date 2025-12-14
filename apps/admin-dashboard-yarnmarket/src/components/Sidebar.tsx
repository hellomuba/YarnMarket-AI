'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Store, 
  MessageSquare, 
  Users, 
  Settings,
  ListTodo as Queue,
  TestTube2,
  ChevronLeft,
  ChevronRight,
  Activity
} from 'lucide-react';
import { Merchant } from '@/types';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  selectedMerchant: Merchant | null;
  onMerchantSelect: (merchant: Merchant | null) => void;
}

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Merchants', href: '/merchants', icon: Store },
  { name: 'Messages', href: '/messages', icon: MessageSquare },
  { name: 'Conversations', href: '/conversations', icon: Users },
  { name: 'Queue Status', href: '/queues', icon: Queue },
  { name: 'RAG Management', href: '/rag-management', icon: Activity },
  { name: 'Test Console', href: '/test-console', icon: TestTube2 },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar({ collapsed, onToggle, selectedMerchant, onMerchantSelect }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div className={`bg-slate-900 border-r border-slate-800 flex flex-col h-full transition-all duration-300 ${
      collapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Header */}
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-white font-semibold text-sm">YarnMarket AI</h1>
                <p className="text-slate-400 text-xs">Admin Dashboard</p>
              </div>
            </div>
          )}
          <button
            onClick={onToggle}
            className="p-1 text-slate-400 hover:text-white transition-colors"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Selected Merchant */}
      {selectedMerchant && (
        <div className="p-4 border-b border-slate-800">
          {!collapsed ? (
            <div className="space-y-2">
              <p className="text-slate-400 text-xs uppercase tracking-wide">Selected Merchant</p>
              <div className="bg-slate-800 rounded-lg p-3">
                <p className="text-white font-medium text-sm">{selectedMerchant.business_name}</p>
                <p className="text-slate-400 text-xs">{selectedMerchant.phone_number}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    selectedMerchant.status === 'active' 
                      ? 'bg-green-600/20 text-green-400' 
                      : 'bg-slate-600/20 text-slate-400'
                  }`}>
                    {selectedMerchant.status}
                  </span>
                  <button
                    onClick={() => onMerchantSelect(null)}
                    className="text-xs text-slate-400 hover:text-white transition-colors"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                <Store className="w-4 h-4 text-white" />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                isActive
                  ? 'bg-green-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span className="text-sm font-medium">{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-800">
        {!collapsed ? (
          <div className="text-center">
            <p className="text-slate-500 text-xs">YarnMarket AI v1.0.0</p>
            <p className="text-slate-600 text-xs mt-1">Multi-Tenant Dashboard</p>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-2 h-2 bg-green-600 rounded-full"></div>
          </div>
        )}
      </div>
    </div>
  );
}
