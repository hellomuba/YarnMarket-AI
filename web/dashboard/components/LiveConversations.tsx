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

// Mock conversation data
const mockConversations: Conversation[] = [
  {
    id: '1',
    customerPhone: '+234801234567',
    customerName: 'Kemi Adebayo',
    lastMessage: 'Abeg, the price too high. You fit reduce am small?',
    aiResponse: 'Customer, I understand say the price dey worry you. Make we meet at ₦15,000?',
    timestamp: new Date(Date.now() - 2 * 60 * 1000),
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
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
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
    timestamp: new Date(Date.now() - 1 * 60 * 1000),
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
    timestamp: new Date(Date.now() - 30 * 1000),
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

  useEffect(() => {
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
    const minutes = Math.floor((Date.now() - timestamp.getTime()) / (1000 * 60))
    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    return `${hours}h ago`
  }

  return (
    <div className=\"space-y-4\">
      <AnimatePresence>
        {conversations.map((conversation) => (
          <motion.div
            key={conversation.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`border rounded-lg p-4 transition-all duration-200 hover:shadow-md cursor-pointer ${
              selectedConversation === conversation.id ? 'ring-2 ring-blue-500 bg-blue-50' : 'bg-white'
            }`}
            onClick={() => setSelectedConversation(
              selectedConversation === conversation.id ? null : conversation.id
            )}
          >
            {/* Conversation Header */}
            <Flex className=\"mb-3\">
              <div className=\"flex items-center space-x-3\">
                <div className=\"flex-shrink-0\">
                  <div className=\"w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center\">
                    <PhoneIcon className=\"w-5 h-5 text-gray-600\" />
                  </div>
                </div>
                <div className=\"min-w-0 flex-1\">
                  <div className=\"flex items-center space-x-2\">
                    <Text className=\"font-semibold text-gray-900 truncate\">
                      {conversation.customerName || conversation.customerPhone}
                    </Text>
                    <span className=\"text-lg\">{getLanguageFlag(conversation.language)}</span>
                    <span className=\"text-sm\">{getSentimentEmoji(conversation.sentiment)}</span>
                  </div>
                  <div className=\"flex items-center space-x-2 mt-1\">
                    <Text className=\"text-sm text-gray-500\">
                      {conversation.customerPhone}
                    </Text>
                    <Badge color={getStatusColor(conversation.status)} size=\"xs\">
                      {conversation.status}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className=\"flex items-center space-x-2\">
                <div className=\"text-right\">
                  <Text className=\"text-sm font-medium text-gray-900\">
                    ₦{conversation.estimatedValue.toLocaleString()}
                  </Text>
                  <div className=\"flex items-center space-x-1 mt-1\">
                    <ClockIcon className=\"w-4 h-4 text-gray-400\" />
                    <Text className=\"text-xs text-gray-500\">
                      {formatTimeAgo(conversation.timestamp)}
                    </Text>
                  </div>
                </div>
              </div>
            </Flex>

            {/* Conversation Preview */}
            <div className=\"bg-gray-50 rounded-lg p-3 mb-3\">
              <div className=\"space-y-2\">
                <div className=\"flex justify-end\">
                  <div className=\"bg-blue-500 text-white rounded-lg px-3 py-2 max-w-xs\">
                    <Text className=\"text-sm\">{conversation.lastMessage}</Text>
                  </div>
                </div>
                <div className=\"flex justify-start\">
                  <div className=\"bg-white border rounded-lg px-3 py-2 max-w-xs\">
                    <Text className=\"text-sm\">{conversation.aiResponse}</Text>
                    <div className=\"flex items-center mt-1 space-x-1\">
                      <div className=\"w-2 h-2 bg-green-400 rounded-full animate-pulse\"></div>
                      <Text className=\"text-xs text-gray-500\">AI responding...</Text>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <Flex className=\"space-x-2\">
              <Button
                size=\"xs\"
                variant=\"secondary\"
                icon={HandRaisedIcon}
                onClick={(e) => {
                  e.stopPropagation()
                  handleTakeover(conversation.id)
                }}
              >
                Take Over
              </Button>
              <Button
                size=\"xs\"
                variant=\"secondary\"
                icon={FlagIcon}
                color={conversation.status === 'escalated' ? 'red' : 'gray'}
                onClick={(e) => {
                  e.stopPropagation()
                  handleFlag(conversation.id)
                }}
              >
                Flag
              </Button>
              <div className=\"flex-1\" />
              <Badge color=\"gray\" size=\"xs\">
                {conversation.messageCount} messages
              </Badge>
            </Flex>

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