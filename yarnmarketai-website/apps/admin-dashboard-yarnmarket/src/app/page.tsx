'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { systemApi, merchantsApi, messagesApi } from '@/lib/api';
import { Activity, Users, MessageCircle, TrendingUp, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

function MetricCard({ title, value, icon: Icon, change, color = 'green' }: {
  title: string;
  value: string | number;
  icon: any;
  change?: string;
  color?: 'green' | 'blue' | 'yellow' | 'red';
}) {
  const colorClasses = {
    green: 'bg-green-600/20 text-green-400 border-green-600/30',
    blue: 'bg-blue-600/20 text-blue-400 border-blue-600/30',
    yellow: 'bg-yellow-600/20 text-yellow-400 border-yellow-600/30',
    red: 'bg-red-600/20 text-red-400 border-red-600/30',
  };

  return (
    <div className={`p-6 rounded-lg border ${colorClasses[color]} bg-opacity-50 backdrop-blur-sm`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-400 text-sm">{title}</p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
          {change && (
            <p className="text-sm text-slate-400 mt-1">{change}</p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}

function SystemHealthCard() {
  const { data: health, isLoading } = useQuery({
    queryKey: ['health'],
    queryFn: systemApi.getHealth,
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">System Health</h3>
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-slate-600 rounded"></div>
          <div className="h-4 bg-slate-600 rounded"></div>
          <div className="h-4 bg-slate-600 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">System Health</h3>
        <div className={`px-3 py-1 rounded-full text-sm ${
          health?.status === 'healthy' 
            ? 'bg-green-600/20 text-green-400' 
            : 'bg-red-600/20 text-red-400'
        }`}>
          {health?.status?.toUpperCase() || 'UNKNOWN'}
        </div>
      </div>
      
      <div className="space-y-3">
        {health?.services && Object.entries(health.services).map(([service, status]) => (
          <div key={service} className="flex items-center justify-between">
            <span className="text-slate-300 capitalize">{service}</span>
            <div className="flex items-center space-x-2">
              {status === 'healthy' ? (
                <CheckCircle2 className="w-4 h-4 text-green-400" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-400" />
              )}
              <span className={`text-sm ${
                status === 'healthy' ? 'text-green-400' : 'text-red-400'
              }`}>
                {status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const router = useRouter();
  
  const { data: metrics } = useQuery({
    queryKey: ['metrics'],
    queryFn: () => systemApi.getMetrics(),
    refetchInterval: 30000,
  });

  const { data: merchants } = useQuery({
    queryKey: ['merchants'],
    queryFn: merchantsApi.getAll,
  });

  const { data: recentMessages } = useQuery({
    queryKey: ['recent-messages'],
    queryFn: () => messagesApi.getAll({ limit: 10 }),
  });

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'add-merchant':
        router.push('/merchants');
        break;
      case 'send-test':
        router.push('/test-console');
        break;
      case 'view-analytics':
        router.push('/messages');
        break;
      default:
        break;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard Overview</h1>
        <p className="text-slate-400 mt-2">Monitor your YarnMarket AI system performance and activity</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Merchants"
          value={metrics?.total_merchants || merchants?.length || 0}
          icon={Users}
          color="blue"
        />
        
        <MetricCard
          title="Messages Today"
          value={metrics?.total_messages_today || 0}
          icon={MessageCircle}
          change={`${metrics?.success_rate?.toFixed(1) || 0}% success rate`}
          color="green"
        />
        
        <MetricCard
          title="Active Conversations"
          value={metrics?.active_conversations || 0}
          icon={Activity}
          color="yellow"
        />
        
        <MetricCard
          title="Avg Response Time"
          value={`${metrics?.avg_processing_time_ms?.toFixed(0) || 0}ms`}
          icon={Clock}
          color="green"
        />
      </div>

      {/* System Health and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SystemHealthCard />
        
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Messages</h3>
          <div className="space-y-3">
            {recentMessages?.slice(0, 5).map((message) => (
              <div key={message.id} className="flex items-center justify-between py-2 border-b border-slate-700 last:border-0">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{message.content}</p>
                  <p className="text-xs text-slate-400">From: {message.from_phone}</p>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    message.status === 'sent' ? 'bg-green-600/20 text-green-400' :
                    message.status === 'failed' ? 'bg-red-600/20 text-red-400' :
                    'bg-yellow-600/20 text-yellow-400'
                  }`}>
                    {message.status}
                  </span>
                </div>
              </div>
            )) || (
              <p className="text-slate-400 text-center py-4">No recent messages</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={() => handleQuickAction('add-merchant')}
            className="p-4 bg-green-600 hover:bg-green-700 rounded-lg transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
          >
            <Users className="w-6 h-6 text-white mb-2" />
            <span className="text-white font-medium">Add New Merchant</span>
          </button>
          
          <button 
            onClick={() => handleQuickAction('send-test')}
            className="p-4 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            <MessageCircle className="w-6 h-6 text-white mb-2" />
            <span className="text-white font-medium">Send Test Message</span>
          </button>
          
          <button 
            onClick={() => handleQuickAction('view-analytics')}
            className="p-4 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
          >
            <TrendingUp className="w-6 h-6 text-white mb-2" />
            <span className="text-white font-medium">View Analytics</span>
          </button>
        </div>
      </div>
    </div>
  );
}
