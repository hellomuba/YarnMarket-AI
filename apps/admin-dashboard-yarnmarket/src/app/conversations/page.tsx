'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Search,
  MessageCircle,
  Phone,
  Calendar,
  Clock,
  User,
  Building,
  ChevronRight,
  Filter
} from 'lucide-react';
import { conversationsApi } from '@/lib/api';
import { Conversation } from '@/types';

interface ConversationFilters {
  status: string;
  merchantId?: string;
  dateRange: string;
}

const ConversationCard: React.FC<{
  conversation: Conversation;
  onSelect: (conversation: Conversation) => void;
}> = ({ conversation, onSelect }) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-600/20 text-green-400 border-green-600/30';
      case 'completed':
        return 'bg-blue-600/20 text-blue-400 border-blue-600/30';
      case 'pending':
        return 'bg-yellow-600/20 text-yellow-400 border-yellow-600/30';
      case 'archived':
        return 'bg-slate-600/20 text-slate-400 border-slate-600/30';
      default:
        return 'bg-slate-600/20 text-slate-400 border-slate-600/30';
    }
  };

  const lastMessage = conversation.messages?.[conversation.messages.length - 1];
  const messageCount = conversation.message_count || conversation.messages?.length || 0;

  return (
    <div
      className="bg-slate-800 rounded-lg border border-slate-700 p-4 hover:border-slate-600 transition-colors cursor-pointer"
      onClick={() => onSelect(conversation)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="bg-slate-700 rounded-full p-2">
            <User className="h-4 w-4 text-slate-300" />
          </div>
          <div>
            <h3 className="text-white font-medium">{conversation.customer_phone}</h3>
            <p className="text-slate-400 text-sm flex items-center">
              <Building className="h-3 w-3 mr-1" />
              {conversation.merchant_business_name || conversation.merchant_id}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(conversation.status)}`}>
            {conversation.status}
          </span>
          <ChevronRight className="h-4 w-4 text-slate-400" />
        </div>
      </div>

      <div className="space-y-2">
        {lastMessage && (
          <div className="bg-slate-700/50 rounded p-2">
            <p className="text-slate-300 text-sm line-clamp-2">
              {lastMessage.ai_response || lastMessage.content}
            </p>
            <div className="flex items-center justify-between mt-2">
              <span className="text-slate-500 text-xs">
                {lastMessage.ai_response ? 'AI Response' : 'Customer Message'}
              </span>
              <span className="text-slate-500 text-xs">
                {new Date(lastMessage.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center text-slate-400">
            <MessageCircle className="h-4 w-4 mr-1" />
            {messageCount} messages
          </div>
          <div className="flex items-center text-slate-400">
            <Clock className="h-4 w-4 mr-1" />
            {new Date(conversation.last_activity || conversation.created_at).toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );
};

const ConversationDetailModal: React.FC<{
  conversation: Conversation | null;
  isOpen: boolean;
  onClose: () => void;
}> = ({ conversation, isOpen, onClose }) => {
  if (!isOpen || !conversation) return null;

  const messages = conversation.messages || [];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-lg w-full max-w-4xl h-[80vh] border border-slate-700 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="bg-slate-700 rounded-full p-2">
              <User className="h-5 w-5 text-slate-300" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">{conversation.customer_phone}</h2>
              <p className="text-slate-400 text-sm">
                {conversation.merchant_business_name || conversation.merchant_id}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Conversation Stats */}
        <div className="p-4 bg-slate-900 border-b border-slate-700">
          <div className="grid grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-slate-400">Status:</span>
              <span className="ml-2 text-white capitalize">{conversation.status}</span>
            </div>
            <div>
              <span className="text-slate-400">Messages:</span>
              <span className="ml-2 text-white">{messages.length}</span>
            </div>
            <div>
              <span className="text-slate-400">Started:</span>
              <span className="ml-2 text-white">
                {new Date(conversation.created_at).toLocaleDateString()}
              </span>
            </div>
            <div>
              <span className="text-slate-400">Last Activity:</span>
              <span className="ml-2 text-white">
                {new Date(conversation.last_activity || conversation.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message, index) => (
            <div
              key={message.id || index}
              className={`flex ${message.ai_response ? 'justify-end' : 'justify-start'}`}
            >
              <div className="max-w-[70%] space-y-1">
                {/* Customer Message */}
                {!message.ai_response && (
                  <div className="bg-slate-700 rounded-lg p-3">
                    <p className="text-white text-sm">{message.content}</p>
                    <div className="flex items-center justify-between mt-2 text-xs text-slate-400">
                      <span>Customer</span>
                      <span>{new Date(message.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                )}

                {/* AI Response */}
                {message.ai_response && (
                  <div className="bg-green-600 rounded-lg p-3">
                    <p className="text-white text-sm">{message.ai_response}</p>
                    <div className="flex items-center justify-between mt-2 text-xs text-green-100">
                      <span>AI Assistant</span>
                      <span>{new Date(message.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                )}

                {/* Processing Info */}
                {message.processing_time && (
                  <div className="text-xs text-slate-500">
                    Processed in {message.processing_time.toFixed(2)}s
                  </div>
                )}
              </div>
            </div>
          ))}

          {messages.length === 0 && (
            <div className="text-center py-12">
              <MessageCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-500">No messages in this conversation</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function ConversationsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<ConversationFilters>({
    status: 'all',
    dateRange: 'all',
  });
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const { data: conversations, isLoading } = useQuery({
    queryKey: ['conversations', filters],
    queryFn: () => conversationsApi.getAll(filters),
  });

  const handleFilterChange = (key: keyof ConversationFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setIsDetailModalOpen(true);
  };

  const filteredConversations = conversations?.filter(conversation => {
    const matchesSearch = 
      conversation.customer_phone.includes(searchTerm) ||
      (conversation.merchant_business_name && 
       conversation.merchant_business_name.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-600 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="h-40 bg-slate-700 rounded"></div>
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
          <h1 className="text-2xl font-bold text-white">Conversations</h1>
          <p className="text-slate-400">{conversations?.length || 0} conversations total</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-slate-800 rounded-lg p-4 mb-6 border border-slate-700">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by phone number or merchant..."
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
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="archived">Archived</option>
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

      {/* Conversations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredConversations?.map((conversation) => (
          <ConversationCard
            key={conversation.id}
            conversation={conversation}
            onSelect={handleSelectConversation}
          />
        ))}
      </div>

      {filteredConversations?.length === 0 && (
        <div className="text-center py-12">
          <MessageCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-500">No conversations found</p>
          <p className="text-slate-600 text-sm">Try adjusting your search or filter criteria</p>
        </div>
      )}

      {/* Conversation Detail Modal */}
      <ConversationDetailModal
        conversation={selectedConversation}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedConversation(null);
        }}
      />
    </div>
  );
}
