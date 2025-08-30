'use client'

import { useState, useEffect } from 'react'
import { Search, Send, Phone, Video, MoreVertical, User, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { dashboardAPI } from '../../lib/api'

interface Message {
  id: string
  text: string
  sender: 'customer' | 'ai' | 'merchant' | 'system'
  timestamp: string
}

interface Conversation {
  id: string
  customerPhone: string
  customerName?: string
  lastMessage: string
  timestamp: string
  language: string
  status: 'active' | 'negotiating' | 'waiting' | 'escalated'
  unread: boolean
  messageCount: number
  avatar: string
}

// Mock conversation data with Nigerian context
const mockConversations: Conversation[] = [
  {
    id: '1',
    customerPhone: '+234801234567',
    customerName: 'Kemi Adebayo',
    lastMessage: 'Abeg, the price too high. You fit reduce am small?',
    timestamp: '2024-01-15T14:30:00Z',
    language: 'pidgin',
    status: 'negotiating',
    unread: true,
    messageCount: 8,
    avatar: 'KA'
  },
  {
    id: '2',
    customerPhone: '+234703456789',
    customerName: 'Ibrahim Hassan',
    lastMessage: 'Do you have this in blue color?',
    timestamp: '2024-01-15T14:25:00Z',
    language: 'english',
    status: 'active',
    unread: true,
    messageCount: 4,
    avatar: 'IH'
  },
  {
    id: '3',
    customerPhone: '+234812345678',
    customerName: 'Chioma Okafor',
    lastMessage: 'Perfect! I will take 3 pieces.',
    timestamp: '2024-01-15T14:20:00Z',
    language: 'english',
    status: 'active',
    unread: false,
    messageCount: 12,
    avatar: 'CO'
  },
  {
    id: '4',
    customerPhone: '+234909876543',
    customerName: 'Aisha Bello',
    lastMessage: 'Wetin be the price for this shoe?',
    timestamp: '2024-01-15T14:15:00Z',
    language: 'pidgin',
    status: 'active',
    unread: false,
    messageCount: 3,
    avatar: 'AB'
  }
]

const mockMessages: { [key: string]: Message[] } = {
  '1': [
    {
      id: '1',
      text: 'Hello! I dey interested for this shirt wey you post',
      sender: 'customer',
      timestamp: '2024-01-15T14:00:00Z'
    },
    {
      id: '2',
      text: 'Welcome! That shirt na fine quality cotton. The price na ₦8,000 but I fit do ₦7,500 for you.',
      sender: 'ai',
      timestamp: '2024-01-15T14:01:00Z'
    },
    {
      id: '3',
      text: 'Abeg, the price too high. You fit reduce am small?',
      sender: 'customer',
      timestamp: '2024-01-15T14:30:00Z'
    }
  ]
}

export default function Conversations() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'reconnecting'>('connected')

  useEffect(() => {
    loadConversations()
    // Simulate connection status
    const interval = setInterval(() => {
      setConnectionStatus(Math.random() > 0.8 ? 'disconnected' : 'connected')
    }, 30000)
    
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (selectedConversation) {
      const conversationMessages = mockMessages[selectedConversation.id] || []
      setMessages(conversationMessages)
    }
  }, [selectedConversation])

  const loadConversations = async () => {
    try {
      setIsLoading(true)
      // Try to get real conversations from API
      const realConversations = await dashboardAPI.getConversations()
      
      // Map to our conversation format
      const formattedConversations: Conversation[] = realConversations.map((conv, index) => ({
        id: conv.id,
        customerPhone: conv.customerPhone,
        customerName: conv.customerName,
        lastMessage: conv.lastMessage,
        timestamp: conv.timestamp,
        language: conv.language,
        status: conv.status,
        unread: Math.random() > 0.5,
        messageCount: conv.messageCount || Math.floor(Math.random() * 10) + 1,
        avatar: conv.customerName ? conv.customerName.split(' ').map(n => n[0]).join('').toUpperCase() : `C${index + 1}`
      }))
      
      setConversations(formattedConversations)
    } catch (error) {
      console.warn('Failed to load conversations from API, using mock data')
      setConversations(mockConversations)
      setConnectionStatus('disconnected')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return

    const optimisticMessage: Message = {
      id: Date.now().toString(),
      text: newMessage,
      sender: 'merchant',
      timestamp: new Date().toISOString(),
    }

    setMessages(prev => [...prev, optimisticMessage])
    setNewMessage('')

    try {
      // Simulate AI response
      setTimeout(() => {
        const aiResponse: Message = {
          id: `${Date.now()}-ai`,
          text: 'Thank you for your message. Let me help you with that!',
          sender: 'ai',
          timestamp: new Date().toISOString(),
        }
        setMessages(prev => [...prev, aiResponse])
      }, 1000)
    } catch (error) {
      const errorMsg: Message = {
        id: `${Date.now()}-error`,
        text: 'Failed to send message. Please try again.',
        sender: 'system',
        timestamp: new Date().toISOString(),
      }
      setMessages(prev => [...prev, errorMsg])
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'negotiating': return 'bg-yellow-100 text-yellow-800'
      case 'waiting': return 'bg-blue-100 text-blue-800'
      case 'escalated': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getLanguageFlag = (language: string) => {
    switch (language) {
      case 'pidgin': return '🇳🇬'
      case 'english': return '🇬🇧'
      case 'yoruba': return '👑'
      case 'igbo': return '🦅'
      case 'hausa': return '🌾'
      default: return '🌍'
    }
  }

  const filteredConversations = conversations.filter(conv =>
    conv.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.customerPhone.includes(searchTerm)
  )

  const unreadCount = conversations.filter(c => c.unread).length

  return (
    <div className="bg-gradient-to-br from-gray-50 via-blue-50/30 to-emerald-50/30 dark:from-gray-900 dark:via-blue-950/30 dark:to-emerald-950/30 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 pt-32">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-2">
                <span>💬</span>
                <span>YarnMarket Conversations</span>
              </h1>
              <p className="text-gray-600 mt-1">AI-powered customer chat with cultural haggling</p>
            </div>
            
            {/* Connection Status */}
            <div className="flex items-center space-x-4">
              {connectionStatus === 'disconnected' && (
                <div className="flex items-center space-x-2 bg-red-50 text-red-700 px-3 py-1 rounded-full">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">Disconnected</span>
                  <button 
                    onClick={loadConversations}
                    className="text-xs bg-red-100 px-2 py-0.5 rounded"
                  >
                    Retry
                  </button>
                </div>
              )}
              {connectionStatus === 'connected' && (
                <div className="flex items-center space-x-2 bg-green-50 text-green-700 px-3 py-1 rounded-full">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm">Live</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Connection Error */}
        {connectionStatus === 'disconnected' && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <div>
                <h3 className="text-red-800 font-medium">Chat service disconnected - Trying to reconnect...</h3>
                <button
                  onClick={loadConversations}
                  className="text-red-700 underline text-sm mt-1"
                >
                  Retry now
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Insights */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Insights</h3>
            <div className="text-2xl font-bold text-blue-600">{unreadCount} unread</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">{connectionStatus === 'connected' ? 'Connected' : 'Disconnected'}</h3>
            {connectionStatus === 'disconnected' && (
              <button
                onClick={loadConversations}
                className="text-blue-600 underline"
              >
                Retry
              </button>
            )}
          </div>
        </div>

        {/* Chat Interface */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="flex h-96">
            {/* Conversations List */}
            <div className="w-1/3 border-r border-gray-200 flex flex-col">
              {/* Search */}
              <div className="p-4 border-b border-gray-200">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search conversations..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="flex border-b border-gray-200 text-sm">
                <button className="px-4 py-2 text-blue-600 border-b-2 border-blue-600">
                  All ({conversations.length})
                </button>
                <button className="px-4 py-2 text-gray-600">
                  Unread ({unreadCount})
                </button>
              </div>

              {/* Conversations */}
              <div className="flex-1 overflow-y-auto">
                {isLoading ? (
                  <div className="p-4 space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse flex space-x-3">
                        <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                          <div className="h-3 bg-gray-300 rounded w-3/4"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <AnimatePresence>
                    {filteredConversations.map((conversation) => (
                      <motion.div
                        key={conversation.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                          selectedConversation?.id === conversation.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                        }`}
                        onClick={() => setSelectedConversation(conversation)}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                            {conversation.avatar}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-medium text-gray-900 truncate flex items-center space-x-1">
                                <span>{conversation.customerName || conversation.customerPhone}</span>
                                <span>{getLanguageFlag(conversation.language)}</span>
                              </h4>
                              <div className="flex items-center space-x-1">
                                <span className="text-xs text-gray-500">
                                  {new Date(conversation.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </span>
                                {conversation.unread && (
                                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center justify-between mt-1">
                              <p className="text-xs text-gray-600 truncate">
                                {conversation.lastMessage}
                              </p>
                              {conversation.unread && (
                                <span className="text-xs bg-blue-500 text-white px-1.5 py-0.5 rounded-full">
                                  {conversation.messageCount}
                                </span>
                              )}
                            </div>
                            <div className="mt-2">
                              <span className={`inline-block px-2 py-0.5 rounded-full text-xs ${getStatusColor(conversation.status)}`}>
                                {conversation.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
                
                {/* Footer */}
                <div className="p-4 text-center text-sm text-gray-500 border-t border-gray-100">
                  {conversations.length} of {conversations.length} conversations • {unreadCount} unread
                </div>
              </div>
            </div>

            {/* Chat Window */}
            <div className="flex-1 flex flex-col">
              {selectedConversation ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                        {selectedConversation.avatar}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 flex items-center space-x-2">
                          <span>{selectedConversation.customerName || selectedConversation.customerPhone}</span>
                          <span>{getLanguageFlag(selectedConversation.language)}</span>
                        </h3>
                        <p className="text-sm text-gray-500">
                          {selectedConversation.status} • {selectedConversation.language}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100">
                        <Phone className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100">
                        <Video className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    <AnimatePresence>
                      {messages.map((message) => (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex ${message.sender === 'merchant' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-xs px-4 py-2 rounded-lg ${
                              message.sender === 'merchant'
                                ? 'bg-blue-500 text-white'
                                : message.sender === 'ai'
                                ? 'bg-green-100 text-green-900'
                                : message.sender === 'system'
                                ? 'bg-red-100 text-red-900'
                                : 'bg-gray-200 text-gray-900'
                            }`}
                          >
                            <p className="text-sm">{message.text}</p>
                            <p
                              className={`text-xs mt-1 ${
                                message.sender === 'merchant' ? 'text-blue-100' : 'text-gray-500'
                              }`}
                            >
                              {new Date(message.timestamp).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t border-gray-200">
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSendMessage()
                        }}
                      />
                      <button
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition flex items-center"
                        onClick={handleSendMessage}
                      >
                        <Send className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                  <div className="bg-gray-100 rounded-full p-4 mb-4">
                    <User className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
                  <p className="text-gray-500 max-w-md">
                    Choose a conversation from the list to start chatting with your customers
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}