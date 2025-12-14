'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Server,
  Activity,
  Users,
  MessageSquare,
  Clock,
  AlertTriangle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { queuesApi } from '@/lib/api';

const QueueCard: React.FC<{
  name: string;
  messageCount: number;
  consumerCount: number;
  status: 'healthy' | 'warning' | 'error';
}> = ({ name, messageCount, consumerCount, status }) => {
  const statusConfig = {
    healthy: {
      color: 'border-green-600/30 bg-green-600/10',
      icon: <CheckCircle className="h-5 w-5 text-green-400" />,
      text: 'text-green-400'
    },
    warning: {
      color: 'border-yellow-600/30 bg-yellow-600/10',
      icon: <AlertTriangle className="h-5 w-5 text-yellow-400" />,
      text: 'text-yellow-400'
    },
    error: {
      color: 'border-red-600/30 bg-red-600/10',
      icon: <AlertTriangle className="h-5 w-5 text-red-400" />,
      text: 'text-red-400'
    }
  };

  const config = statusConfig[status];

  return (
    <div className={`bg-slate-800 rounded-lg border p-6 ${config.color}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Server className="h-6 w-6 text-slate-300" />
          <h3 className="text-lg font-semibold text-white">{name}</h3>
        </div>
        {config.icon}
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-700/50 rounded p-3">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-sm">Messages</span>
            <MessageSquare className="h-4 w-4 text-slate-500" />
          </div>
          <p className="text-xl font-semibold text-white mt-1">{messageCount.toLocaleString()}</p>
        </div>
        
        <div className="bg-slate-700/50 rounded p-3">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-sm">Consumers</span>
            <Users className="h-4 w-4 text-slate-500" />
          </div>
          <p className="text-xl font-semibold text-white mt-1">{consumerCount}</p>
        </div>
      </div>
    </div>
  );
};

export default function QueuesPage() {
  const { data: queues, isLoading, error } = useQuery({
    queryKey: ['queues'],
    queryFn: queuesApi.getStatus,
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 text-green-500 animate-spin mx-auto mb-4" />
            <p className="text-slate-400">Loading queue information...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Queue Service Unavailable</h2>
            <p className="text-slate-400">Unable to connect to message queue service</p>
          </div>
        </div>
      </div>
    );
  }

  // Use the queues from API or fallback
  const displayQueues = queues || [];
  const totalMessages = displayQueues.reduce((sum, q) => sum + (q.message_count || 0), 0);
  const totalConsumers = displayQueues.reduce((sum, q) => sum + (q.consumer_count || 0), 0);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Message Queues</h1>
          <p className="text-slate-400">Monitor RabbitMQ queue status and performance</p>
        </div>
        <div className="flex items-center space-x-2 text-sm">
          <Activity className="h-4 w-4 text-green-500" />
          <span className="text-slate-300">Live updating</span>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Total Messages</p>
              <p className="text-2xl font-bold text-white mt-1">{totalMessages.toLocaleString()}</p>
            </div>
            <MessageSquare className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Active Consumers</p>
              <p className="text-2xl font-bold text-white mt-1">{totalConsumers}</p>
            </div>
            <Users className="h-8 w-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Queue Count</p>
              <p className="text-2xl font-bold text-white mt-1">{displayQueues.length}</p>
            </div>
            <Server className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Queue Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {displayQueues.map((queue) => (
          <QueueCard
            key={queue.name}
            name={queue.name}
            messageCount={queue.message_count || 0}
            consumerCount={queue.consumer_count || 0}
            status={queue.status || 'healthy'}
          />
        ))}
      </div>

      {displayQueues.length === 0 && (
        <div className="text-center py-12">
          <Server className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-500">No message queues found</p>
        </div>
      )}
    </div>
  );
}
