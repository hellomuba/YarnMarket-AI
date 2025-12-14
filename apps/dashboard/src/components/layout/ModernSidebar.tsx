import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  MessageCircle,
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap,
  Activity,
  Brain,
  Layers
} from 'lucide-react';
import { Merchant } from '../../types';

interface ModernSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  selectedMerchant: Merchant | null;
  onMerchantSelect: (merchant: Merchant | null) => void;
}

const menuItems = [
  {
    path: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    gradient: 'from-blue-500 to-purple-500'
  },
  {
    path: '/conversation-tester',
    label: 'Conversation Tester',
    icon: Brain,
    gradient: 'from-green-500 to-teal-500'
  },
  {
    path: '/merchants',
    label: 'Merchants',
    icon: Users,
    gradient: 'from-purple-500 to-pink-500'
  },
  {
    path: '/messages',
    label: 'Messages',
    icon: MessageSquare,
    gradient: 'from-orange-500 to-red-500'
  },
  {
    path: '/conversations',
    label: 'Conversations',
    icon: MessageCircle,
    gradient: 'from-teal-500 to-cyan-500'
  },
  {
    path: '/queues',
    label: 'Queues',
    icon: Layers,
    gradient: 'from-yellow-500 to-orange-500'
  },
  {
    path: '/settings',
    label: 'Settings',
    icon: Settings,
    gradient: 'from-slate-500 to-slate-600'
  }
];

export const ModernSidebar: React.FC<ModernSidebarProps> = ({
  collapsed,
  onToggle,
  selectedMerchant,
  // onMerchantSelect - TODO: implement merchant selection
}) => {
  return (
    <motion.div
      className="relative h-full glass-dark border-r border-slate-700/50"
      animate={{ width: collapsed ? '80px' : '280px' }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-3"
            >
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <motion.div
                  className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gradient">YarnMarket</h2>
                <p className="text-xs text-slate-400">AI Dashboard</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <motion.button
          onClick={onToggle}
          className="p-2 hover:bg-slate-800/50 rounded-lg transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-slate-400" />
          )}
        </motion.button>
      </div>

      {/* Merchant Selector */}
      <AnimatePresence>
        {!collapsed && selectedMerchant && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="p-4 border-b border-slate-700/50 bg-gradient-to-r from-blue-500/10 to-purple-500/10"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                {selectedMerchant.business_name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-200 truncate">
                  {selectedMerchant.business_name}
                </p>
                <p className="text-xs text-slate-400 truncate">
                  {selectedMerchant.phone_number}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item, index) => (
          <motion.div
            key={item.path}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                `relative flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-white border border-blue-500/30'
                    : 'hover:bg-slate-800/50 text-slate-300 hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className={`relative p-1 rounded-lg bg-gradient-to-r ${item.gradient} ${isActive ? 'shadow-lg' : 'opacity-70 group-hover:opacity-100'}`}>
                    <item.icon className="w-4 h-4 text-white" />
                  </div>
                  
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                        className="font-medium text-sm"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active-pill"
                      className="absolute right-2 w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </>
              )}
            </NavLink>
          </motion.div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-700/50">
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="flex items-center gap-3"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
                  <Activity className="w-3 h-3" />
                  System Status
                </div>
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
