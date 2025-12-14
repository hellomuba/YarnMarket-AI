'use client'

import React, { useState, useEffect } from 'react'
import { Card, Badge, Button, Flex, Text } from '@tremor/react'
import { 
  PhoneIcon, 
  ChatBubbleLeftIcon,
  HandRaisedIcon,
  FlagIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import { motion, AnimatePresence } from 'framer-motion'

interface Conversation {
  id: string
  customerPhone: string
  customerName?: string
  lastMessage: string
  aiResponse: string
  timestamp: Date
  language: string
  status: 'active' | 'negotiating' | 'waiting' | 'escalated'
  sentiment: 'positive' | 'neutral' | 'negative'
  messageCount: number
  estimatedValue: number
}

// Mock conversation data - using static timestamps to avoid hydration issues
const mockConversations: Conversation[] = [
  {
    id: '1',
    customerPhone: '+234801234567',
    customerName: 'Kemi Adebayo',
    lastMessage: 'Abeg, the price too high. You fit reduce am small?',
    aiResponse: 'Customer, I understand say the price dey worry you. Make we meet at ₦15,000?',
    timestamp: new Date('2024-01-01T14:00:00'),
    language: 'pidgin',
    status: 'negotiating',
    sentiment: 'neutral',
    messageCount: 8,
    estimatedValue: 18000
  },
  {
    id: '2',
    customerPhone: '+234703456789',
    customerName: 'Ibrahim Hassan',
    lastMessage: 'Do you have this in blue color?',
    aiResponse: 'Yes sir! We get am in blue, red and black. Which one you prefer?',
    timestamp: new Date('2024-01-01T13:55:00'),
    language: 'english',
    status: 'active',
    sentiment: 'positive',
    messageCount: 4,
    estimatedValue: 25000
  },
  {
    id: '3',
    customerPhone: '+234812345678',
    lastMessage: 'This thing no good at all! I wan return am!',
    aiResponse: 'I sorry well well for this wahala! Make we sort am out sharp sharp.',
    timestamp: new Date('2024-01-01T14:01:00'),
    language: 'pidgin',
    status: 'escalated',
    sentiment: 'negative',
    messageCount: 12,
    estimatedValue: 0
  },
  {
    id: '4',
    customerPhone: '+234909876543',
    customerName: 'Chioma Okafor',
    lastMessage: 'Perfect! I will take 3 pieces.',
    aiResponse: 'Excellent! So na 3 pieces for ₦45,000 total. Make I package am for you!',
    timestamp: new Date('2024-01-01T14:01:30'),
    language: 'pidgin',
    status: 'active',
    sentiment: 'positive',
    messageCount: 6,
    estimatedValue: 45000
  },
]

export default function LiveConversations() {
  const [conversations, setConversations] = useState<Conversation[]>(mockConversations)
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    
    // Simulate real-time updates
    const interval = setInterval(() => {
      setConversations(prev => prev.map(conv => ({
        ...conv,
        timestamp: Math.random() > 0.8 ? new Date() : conv.timestamp
      })))
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'emerald'
      case 'negotiating': return 'yellow'
      case 'waiting': return 'blue'
      case 'escalated': return 'red'
      default: return 'gray'
    }
  }

  const getSentimentEmoji = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return '😊'
      case 'neutral': return '😐'
      case 'negative': return '😠'
      default: return '🤔'
    }
  }

  const getLanguageFlag = (language: string) => {
    switch (language) {
      case 'pidgin': return '🇳🇬'
      case 'english': return '🇬🇧'
      case 'yoruba': return '🎭'
      case 'igbo': return '🦅'
      case 'hausa': return '🏺'
      default: return '🌍'
    }
  }

  const handleTakeover = (conversationId: string) => {
    // Implement takeover logic
    console.log('Taking over conversation:', conversationId)
  }

  const handleFlag = (conversationId: string) => {
    // Implement flag logic
    console.log('Flagging conversation:', conversationId)
  }

  const formatTimeAgo = (timestamp: Date) => {
    if (!isClient) return '2m ago' // Static value during SSR
    
    const minutes = Math.floor((Date.now() - timestamp.getTime()) / (1000 * 60))
    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    return `${hours}h ago`
  }

  return (
    <div className=\"space-y-6\">
      <AnimatePresence>
        {conversations.map((conversation, index) => (
          <motion.div
            key={conversation.id}
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              transition: { delay: index * 0.1 }
            }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            whileHover={{ scale: 1.02, y: -4 }}
            className={`metric-card relative overflow-hidden cursor-pointer group transition-all duration-300 ${
              selectedConversation === conversation.id 
                ? 'ring-2 ring-blue-500 shadow-xl bg-gradient-to-r from-blue-50 to-purple-50' 
                : 'hover:shadow-xl'
            }`}
            onClick={() => setSelectedConversation(
              selectedConversation === conversation.id ? null : conversation.id
            )}
          >
            {/* Enhanced Conversation Header */}
            <div className=\"relative p-6 bg-gradient-to-r from-gray-50 to-blue-50/30 border-b border-white/50\">
              <div className=\"absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-emerald-400/10 to-blue-400/10 rounded-full -translate-y-10 translate-x-10\"></div>
              <div className=\"relative flex items-center justify-between\">
                <div className=\"flex items-center space-x-4\">
                  <div className=\"relative\">
                    <div className=\"w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold shadow-lg group-hover:shadow-xl transition-shadow duration-300\">
                      {conversation.customerName 
                        ? conversation.customerName.split(' ').map(n => n[0]).join('').slice(0, 2)
                        : conversation.customerPhone.slice(-2)
                      }
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white shadow-sm ${
                      conversation.status === 'active' 
                        ? 'bg-emerald-500 animate-pulse' 
                        : conversation.status === 'negotiating'
                        ? 'bg-amber-500'
                        : conversation.status === 'escalated'
                        ? 'bg-red-500'
                        : 'bg-gray-400'
                    }`}></div>
                  </div>
                  
                  <div className=\"flex-1 min-w-0\">
                    <div className=\"flex items-center space-x-3 mb-2\">
                      <h3 className=\"text-lg font-bold text-gray-900 brand-font truncate\">
                        {conversation.customerName || 'Unknown Customer'}
                      </h3>
                      <span className=\"text-xl\">{getLanguageFlag(conversation.language)}</span>
                      <span className=\"text-lg\">{getSentimentEmoji(conversation.sentiment)}</span>
                    </div>
                    <div className=\"flex items-center space-x-3\">
                      <span className=\"text-sm text-gray-600 font-medium\">
                        {conversation.customerPhone}
                      </span>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                        conversation.status === 'active' 
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                          : conversation.status === 'negotiating'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : conversation.status === 'escalated'
                          ? 'bg-red-100 text-red-800 border border-red-200'
                          : 'bg-gray-100 text-gray-800 border border-gray-200'
                      }`}>
                        {conversation.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className=\"text-right\">
                  <div className=\"bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-white/50 shadow-sm\">
                    <div className=\"text-2xl font-bold text-gray-900 brand-font\">
                      ₦{(conversation.estimatedValue / 1000).toFixed(0)}K
                    </div>
                    <div className=\"flex items-center space-x-2 mt-1 text-gray-500\">
                      <ClockIcon className=\"w-4 h-4\" />
                      <span className=\"text-xs font-medium\">
                        {formatTimeAgo(conversation.timestamp)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Conversation Preview */}
            <div className=\"p-6\">
              <div className=\"bg-gradient-to-br from-gray-50 to-blue-50/20 rounded-2xl p-5 mb-6 border border-gray-200/50\">
                <div className=\"space-y-4\">
                  {/* Customer Message */}
                  <div className=\"flex justify-end\">
                    <div className=\"bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl px-4 py-3 max-w-sm shadow-sm\">
                      <p className=\"text-sm font-medium leading-relaxed\">{conversation.lastMessage}</p>
                      <div className=\"flex items-center justify-between mt-2\">
                        <span className=\"text-xs text-blue-100\">{getLanguageFlag(conversation.language)} {conversation.language}</span>
                        <span className=\"text-xs text-blue-100\">{formatTimeAgo(conversation.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* AI Response */}
                  <div className=\"flex justify-start\">
                    <div className=\"bg-white border border-gray-200 rounded-2xl px-4 py-3 max-w-sm shadow-sm\">
                      <p className=\"text-sm font-medium text-gray-700 leading-relaxed\">{conversation.aiResponse}</p>
                      <div className=\"flex items-center justify-between mt-2\">
                        <div className=\"flex items-center space-x-2\">
                          <div className=\"w-2 h-2 bg-emerald-400 rounded-full animate-pulse\"></div>
                          <span className=\"text-xs text-emerald-600 font-semibold\">AI Assistant</span>
                        </div>
                        <span className=\"text-xs text-gray-500\">Just now</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Conversation Stats */}
                <div className=\"flex items-center justify-between mt-4 pt-4 border-t border-gray-200/50\">
                  <div className=\"flex items-center space-x-4\">
                    <div className=\"flex items-center space-x-2\">
                      <ChatBubbleLeftIcon className=\"w-4 h-4 text-gray-500\" />
                      <span className=\"text-xs text-gray-600 font-medium\">{conversation.messageCount} messages</span>
                    </div>
                    <div className=\"flex items-center space-x-2\">
                      <span className=\"text-lg\">{getSentimentEmoji(conversation.sentiment)}</span>
                      <span className=\"text-xs text-gray-600 font-medium capitalize\">{conversation.sentiment}</span>
                    </div>
                  </div>
                  <div className=\"text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded-full\">
                    AI Confidence: 98%
                  </div>
                </div>
              </div>

              {/* Enhanced Action Buttons */}
              <div className=\"flex items-center justify-between\">
                <div className=\"flex items-center space-x-3\">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleTakeover(conversation.id)
                    }}
                    className=\"inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-bold rounded-full hover:shadow-lg transition-all duration-300 hover:scale-105\"
                  >
                    <HandRaisedIcon className=\"w-4 h-4\" />
                    <span>Take Over</span>
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleFlag(conversation.id)
                    }}
                    className={`inline-flex items-center space-x-2 px-4 py-2 text-xs font-bold rounded-full hover:shadow-lg transition-all duration-300 hover:scale-105 ${
                      conversation.status === 'escalated' 
                        ? 'bg-gradient-to-r from-red-500 to-red-600 text-white'
                        : 'bg-gradient-to-r from-gray-500 to-gray-600 text-white'
                    }`}
                  >
                    <FlagIcon className=\"w-4 h-4\" />
                    <span>Flag Issue</span>
                  </button>
                </div>
                
                <button 
                  onClick={(e) => e.stopPropagation()}
                  className=\"inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-xs font-bold rounded-full hover:shadow-lg transition-all duration-300 hover:scale-105\"
                >
                  <span>View Full Chat</span>
                  <span>→</span>
                </button>
              </div>
            </div>

            {/* Expanded Details */}
            <AnimatePresence>
              {selectedConversation === conversation.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className=\"mt-4 pt-4 border-t border-gray-200\"
                >
                  <div className=\"grid grid-cols-2 gap-4 text-sm\">
                    <div>
                      <Text className=\"font-medium text-gray-700\">Language:</Text>
                      <Text className=\"capitalize\">{conversation.language}</Text>
                    </div>
                    <div>
                      <Text className=\"font-medium text-gray-700\">Sentiment:</Text>
                      <Text className=\"capitalize\">{conversation.sentiment}</Text>
                    </div>
                    <div>
                      <Text className=\"font-medium text-gray-700\">Messages:</Text>
                      <Text>{conversation.messageCount}</Text>
                    </div>
                    <div>
                      <Text className=\"font-medium text-gray-700\">Est. Value:</Text>
                      <Text>₦{conversation.estimatedValue.toLocaleString()}</Text>
                    </div>
                  </div>
                  
                  <div className=\"mt-4 flex space-x-2\">
                    <Button size=\"sm\" className=\"flex-1\">
                      View Full Conversation
                    </Button>
                    <Button size=\"sm\" variant=\"secondary\" className=\"flex-1\">
                      Customer Profile
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </AnimatePresence>

      {conversations.length === 0 && (
        <div className=\"text-center py-12\">
          <ChatBubbleLeftIcon className=\"mx-auto h-12 w-12 text-gray-400\" />
          <Text className=\"mt-2 text-gray-500\">No active conversations</Text>
        </div>
      )}
    </div>
  )
}