'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Search,
  Filter,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  MessageSquare,
  Phone,
  Calendar
} from 'lucide-react';
import { toast } from 'sonner';
import { messagesApi } from '@/lib/api';
import { Message } from '@/types';

interface MessageFilters {
  status: string;
  type: string;
  dateRange: string;
  merchantId?: string;
}

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case 'processed':
      case 'sent':
        return {
          icon: <CheckCircle className="h-3 w-3" />,
          className: 'bg-green-600/20 text-green-400 border-green-600/30'
        };
      case 'failed':
      case 'error':
        return {
          icon: <XCircle className="h-3 w-3" />,
          className: 'bg-red-600/20 text-red-400 border-red-600/30'
        };
      case 'pending':
      case 'processing':
        return {
          icon: <Clock className="h-3 w-3" />,
          className: 'bg-yellow-600/20 text-yellow-400 border-yellow-600/30'
        };
      default:
        return {
          icon: <AlertTriangle className="h-3 w-3" />,
          className: 'bg-slate-600/20 text-slate-400 border-slate-600/30'
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${config.className}`}>
      {config.icon}
      <span className="ml-1 capitalize">{status}</span>
    </span>
  );
};

const MessageDetailsModal: React.FC<{
  message: Message | null;
  isOpen: boolean;
  onClose: () => void;
}> = ({ message, isOpen, onClose }) => {
  if (!isOpen || !message) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-lg p-6 w-full max-w-2xl border border-slate-700 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Message Details</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Status</label>
              <StatusBadge status={message.status} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Type</label>
              <span className="text-white capitalize">{message.type}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">From</label>
              <span className="text-white">{message.from_phone}</span>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Merchant</label>
              <span className="text-white">{message.merchant_business_name || message.merchant_id}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Content</label>
            <div className="bg-slate-700 rounded-lg p-3 text-white whitespace-pre-wrap">
              {message.content}
            </div>
          </div>

          {message.ai_response && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">AI Response</label>
              <div className="bg-slate-700 rounded-lg p-3 text-white whitespace-pre-wrap">
                {message.ai_response}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Created</label>
              <span className="text-white">{new Date(message.created_at).toLocaleString()}</span>
            </div>
            {message.processing_time && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Processing Time</label>
                <span className="text-white">{message.processing_time.toFixed(2)}s</span>
              </div>
            )}
          </div>

          {message.error_message && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Error</label>
              <div className="bg-red-900/50 border border-red-600/50 rounded-lg p-3 text-red-200">
                {message.error_message}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const MessageRow: React.FC<{
  message: Message;
  onViewDetails: (message: Message) => void;
  onRetry: (id: string) => void;
}> = ({ message, onViewDetails, onRetry }) => {
  return (
    <tr className="hover:bg-slate-800/50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <Phone className="h-4 w-4 text-slate-400 mr-2" />
          <span className="text-white text-sm">{message.from_phone}</span>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="max-w-xs truncate text-slate-300 text-sm">
          {message.content}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <StatusBadge status={message.status} />
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="text-slate-300 text-sm capitalize">{message.type}</span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="text-slate-400 text-sm">
          {message.merchant_business_name || message.merchant_id}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center text-slate-400 text-sm">
          <Calendar className="h-4 w-4 mr-1" />
          {new Date(message.created_at).toLocaleDateString()}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onViewDetails(message)}
            className="text-blue-400 hover:text-blue-300 p-1"
            title="View details"
          >
            <Eye className="h-4 w-4" />
          </button>
          {(message.status === 'failed' || message.status === 'error') && (
            <button
              onClick={() => onRetry(message.id)}
              className="text-yellow-400 hover:text-yellow-300 p-1"
              title="Retry"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
};

export default function MessagesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<MessageFilters>({
    status: 'all',
    type: 'all',
    dateRange: 'all',
  });
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const queryClient = useQueryClient();

  const { data: messages, isLoading } = useQuery({
    queryKey: ['messages', filters],
    queryFn: () => messagesApi.getAll(filters),
  });

  const retryMutation = useMutation({
    mutationFn: (messageId: string) => messagesApi.retry(messageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      toast.success('Message retry initiated');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to retry message');
    },
  });

  const handleViewDetails = (message: Message) => {
    setSelectedMessage(message);
    setIsDetailsModalOpen(true);
  };

  const handleRetry = (messageId: string) => {
    if (window.confirm('Are you sure you want to retry this message?')) {
      retryMutation.mutate(messageId);
    }
  };

  const handleFilterChange = (key: keyof MessageFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const filteredMessages = messages?.filter(message => {
    const matchesSearch = 
      message.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.from_phone.includes(searchTerm) ||
      (message.merchant_business_name && message.merchant_business_name.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-600 rounded w-1/3"></div>
          <div className="space-y-3">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="h-16 bg-slate-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Messages</h1>
          <p className="text-slate-400">{messages?.length || 0} messages total</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-slate-800 rounded-lg p-4 mb-6 border border-slate-700">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="processed">Processed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="sent">Sent</option>
          </select>

          <select
            value={filters.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            <option value="text">Text</option>
            <option value="image">Image</option>
            <option value="document">Document</option>
          </select>

          <select
            value={filters.dateRange}
            onChange={(e) => handleFilterChange('dateRange', e.target.value)}
            className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>
      </div>

      {/* Messages Table */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-700">
            <thead className="bg-slate-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  From
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  Content
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  Merchant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-slate-800 divide-y divide-slate-700">
              {filteredMessages?.map((message) => (
                <MessageRow
                  key={message.id}
                  message={message}
                  onViewDetails={handleViewDetails}
                  onRetry={handleRetry}
                />
              ))}
            </tbody>
          </table>
        </div>

        {filteredMessages?.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-500">No messages found</p>
            <p className="text-slate-600 text-sm">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>

      {/* Message Details Modal */}
      <MessageDetailsModal
        message={selectedMessage}
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedMessage(null);
        }}
      />
    </div>
  );
}
