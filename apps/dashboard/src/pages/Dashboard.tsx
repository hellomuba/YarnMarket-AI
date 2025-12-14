import React from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  MessageSquare,
  Brain,
  Target,
  Activity,
  BarChart3,
  User,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { MetricCard } from '../components/dashboard/MetricCard';
import { ChartCard } from '../components/dashboard/ChartCard';
import { ActivityCard } from '../components/dashboard/ActivityCard';
import { StatsCard } from '../components/dashboard/StatsCard';
import { Merchant } from '../types';

interface DashboardProps {
  selectedMerchant: Merchant | null;
}

export const Dashboard: React.FC<DashboardProps> = ({ selectedMerchant }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        duration: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  const metrics = [
    {
      id: 'active_conversations',
      title: 'Active Conversations',
      value: '2,143',
      change: '+12.5%',
      trend: 'up' as const,
      icon: MessageSquare,
      gradient: 'from-blue-500 to-cyan-500',
      description: 'Currently active chats'
    },
    {
      id: 'total_merchants',
      title: 'Total Merchants',
      value: '847',
      change: '+8.2%',
      trend: 'up' as const,
      icon: Users,
      gradient: 'from-purple-500 to-pink-500',
      description: 'Registered merchants'
    },
    {
      id: 'ai_responses',
      title: 'AI Responses Today',
      value: '15,692',
      change: '+23.1%',
      trend: 'up' as const,
      icon: Brain,
      gradient: 'from-green-500 to-emerald-500',
      description: 'Automated responses'
    },
    {
      id: 'success_rate',
      title: 'Success Rate',
      value: '94.8%',
      change: '+2.1%',
      trend: 'up' as const,
      icon: Target,
      gradient: 'from-orange-500 to-red-500',
      description: 'Conversation completion'
    }
  ];

  const chartData = [
    { name: 'Mon', conversations: 1200, responses: 980, satisfaction: 92 },
    { name: 'Tue', conversations: 1400, responses: 1150, satisfaction: 94 },
    { name: 'Wed', conversations: 1600, responses: 1320, satisfaction: 91 },
    { name: 'Thu', conversations: 1800, responses: 1540, satisfaction: 96 },
    { name: 'Fri', conversations: 2000, responses: 1750, satisfaction: 93 },
    { name: 'Sat', conversations: 1500, responses: 1200, satisfaction: 89 },
    { name: 'Sun', conversations: 1100, responses: 900, satisfaction: 87 }
  ];

  const recentActivities = [
    {
      id: '1',
      type: 'merchant_joined',
      title: 'New Merchant Registration',
      description: 'Kemi\'s Fashion Store joined the platform',
      time: '2 minutes ago',
      icon: User,
      color: 'bg-green-500'
    },
    {
      id: '2',
      type: 'conversation_completed',
      title: 'Conversation Completed',
      description: 'Customer purchased iPhone 14 Pro - ₦850,000',
      time: '5 minutes ago',
      icon: CheckCircle,
      color: 'bg-blue-500'
    },
    {
      id: '3',
      type: 'system_alert',
      title: 'High Traffic Alert',
      description: 'Conversation volume increased by 45%',
      time: '12 minutes ago',
      icon: AlertCircle,
      color: 'bg-orange-500'
    }
  ];

  const performanceData = {
    responseTime: { current: 285, target: 300, trend: 'good' as const },
    accuracy: { current: 94.8, target: 90, trend: 'excellent' as const },
    uptime: { current: 99.9, target: 99.5, trend: 'excellent' as const },
    satisfaction: { current: 4.7, target: 4.0, trend: 'excellent' as const }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <div className="p-6 border-b border-slate-700/50">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gradient">
              YarnMarket AI Dashboard
            </h1>
            <p className="text-slate-400 mt-1">
              {selectedMerchant 
                ? `Managing ${selectedMerchant.business_name}` 
                : 'Overview of all merchant activities'
              }
            </p>
          </div>
          <div className="flex items-center gap-4">
            <motion.div 
              className="flex items-center gap-2 glass px-4 py-2 rounded-lg"
              whileHover={{ scale: 1.02 }}
            >
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm text-slate-300">System Online</span>
            </motion.div>
            <motion.div 
              className="flex items-center gap-2 glass px-4 py-2 rounded-lg"
              whileHover={{ scale: 1.02 }}
            >
              <Activity className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-slate-300">Response: 285ms</span>
            </motion.div>
          </div>
        </div>
      </div>

      <motion.div
        className="p-6 space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Key Metrics Row */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={itemVariants}
        >
          {metrics.map((metric) => (
            <MetricCard key={metric.id} {...metric} />
          ))}
        </motion.div>

        {/* Charts and Analytics Row */}
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          variants={itemVariants}
        >
          {/* Conversation Trends */}
          <div className="lg:col-span-2">
            <ChartCard
              title="Conversation Trends"
              subtitle="Weekly overview of conversations and AI responses"
              data={chartData}
              type="area"
            />
          </div>

          {/* Performance Stats */}
          <div>
            <StatsCard
              title="System Performance"
              subtitle="Real-time metrics"
              data={performanceData}
            />
          </div>
        </motion.div>

        {/* Activity and Details Row */}
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          variants={itemVariants}
        >
          {/* Recent Activity */}
          <div>
            <ActivityCard
              title="Recent Activity"
              subtitle="Latest system events"
              activities={recentActivities}
            />
          </div>

          {/* Language Distribution */}
          <div>
            <ChartCard
              title="Language Distribution"
              subtitle="Customer language preferences"
              data={[
                { name: 'Pidgin', value: 45, color: '#3B82F6' },
                { name: 'English', value: 30, color: '#10B981' },
                { name: 'Yoruba', value: 15, color: '#F59E0B' },
                { name: 'Igbo', value: 10, color: '#EF4444' }
              ]}
              type="pie"
            />
          </div>

          {/* Top Merchants */}
          <div>
            <Card className="h-full">
              <CardHeader>
                <h3 className="text-lg font-semibold text-slate-100">Top Merchants</h3>
                <p className="text-sm text-slate-400">Most active this week</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: "Kemi's Fashion", conversations: 342, revenue: "₦2.8M", trend: "+15%" },
                    { name: "Tech Palace", conversations: 289, revenue: "₦4.1M", trend: "+23%" },
                    { name: "Beauty Store", conversations: 234, revenue: "₦1.9M", trend: "+8%" },
                    { name: "Phone Hub", conversations: 198, revenue: "₦3.2M", trend: "+12%" }
                  ].map((merchant, index) => (
                    <motion.div
                      key={merchant.name}
                      className="flex items-center justify-between p-3 glass-dark rounded-lg hover:bg-slate-800/50 transition-all"
                      whileHover={{ scale: 1.02 }}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                          {merchant.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-200">{merchant.name}</p>
                          <p className="text-xs text-slate-400">{merchant.conversations} conversations</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-slate-200">{merchant.revenue}</p>
                        <p className="text-xs text-green-400">{merchant.trend}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Usage Statistics */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-100">Usage Yesterday, 24 June</h3>
                  <p className="text-sm text-slate-400">Detailed breakdown of system usage</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-slate-100">7 h 34 min</p>
                  <p className="text-xs text-slate-400">Total active time</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                  { label: 'Conversations', value: '2,143', time: '3h 23min', color: 'bg-blue-500' },
                  { label: 'AI Responses', value: '15,692', time: '1h 45min', color: 'bg-green-500' },
                  { label: 'Negotiations', value: '1,847', time: '2h 12min', color: 'bg-purple-500' },
                  { label: 'Completed Sales', value: '894', time: '0h 52min', color: 'bg-orange-500' }
                ].map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    className="text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className={`w-12 h-12 ${stat.color} rounded-full mx-auto mb-3 flex items-center justify-center`}>
                      <BarChart3 className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-lg font-semibold text-slate-200">{stat.value}</p>
                    <p className="text-sm text-slate-400">{stat.label}</p>
                    <p className="text-xs text-slate-500 mt-1">{stat.time}</p>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};
