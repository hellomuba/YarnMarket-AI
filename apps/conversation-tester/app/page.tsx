'use client'

import { useState, useEffect, useRef } from 'react'
import axios from 'axios'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  status?: 'sending' | 'sent' | 'error'
}

interface Merchant {
  id: string
  name: string
  business_name: string
}

export default function ConversationTester() {
  const [merchantId, setMerchantId] = useState('1')
  const [merchants, setMerchants] = useState<Merchant[]>([
    { id: '1', name: 'Test Merchant 1', business_name: 'Fabric Shop Lagos' },
    { id: '2', name: 'Test Merchant 2', business_name: 'Fashion House Abuja' },
    { id: '3', name: 'Test Merchant 3', business_name: 'Textile Store Kano' },
  ])
  const [customerPhone, setCustomerPhone] = useState('+2348012345678')
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [engineUrl, setEngineUrl] = useState('')
  const [showConfig, setShowConfig] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Initialize engine URL after component mounts
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setEngineUrl(process.env.NEXT_PUBLIC_CONVERSATION_ENGINE_URL || '')
    }
  }, [])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!message.trim()) return

    if (!engineUrl.trim()) {
      setError('Please configure conversation engine URL in settings')
      setShowConfig(true)
      return
    }

    const userMessage: Message = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: message.trim(),
      timestamp: new Date(),
      status: 'sending'
    }

    setMessages(prev => [...prev, userMessage])
    setMessage('')
    setLoading(true)
    setError('')

    try {
      const messageId = `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      const payload = {
        merchant_id: merchantId,  // Send as string, not number
        customer_phone: customerPhone,
        message: {
          id: messageId,
          from: customerPhone,
          timestamp: new Date().toISOString(),
          type: 'text',
          text: userMessage.content
        },
        conversation_history: messages
          .filter(m => m.status === 'sent')
          .map(m => ({
            role: m.role,
            content: m.content
          }))
      }

      console.log('Sending payload:', JSON.stringify(payload, null, 2))

      const result = await axios.post(`${engineUrl}/conversation/process`, payload, {
        timeout: 30000,
      })

      console.log('API Response:', JSON.stringify(result.data, null, 2))

      // Update user message status
      setMessages(prev => prev.map(m =>
        m.id === userMessage.id ? { ...m, status: 'sent' } : m
      ))

      // Add assistant response
      const assistantMessage: Message = {
        id: `assistant_${Date.now()}`,
        role: 'assistant',
        content: result.data.text || result.data.response || result.data.message || 'No response',
        timestamp: new Date(),
        status: 'sent'
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (err: any) {
      console.error('Full error object:', err)
      console.error('Error response:', err.response?.data)
      console.error('Error status:', err.response?.status)

      const errorDetail = err.response?.data?.detail || err.response?.data?.message || err.message || 'Failed to connect to conversation engine'

      // Update user message status to error
      setMessages(prev => prev.map(m =>
        m.id === userMessage.id ? { ...m, status: 'error' } : m
      ))

      setError(errorDetail)
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const clearChat = () => {
    setMessages([])
    setError('')
  }

  const selectedMerchant = merchants.find(m => m.id === merchantId)

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xl font-bold">
                Y
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">YarnMarket AI</h1>
                <p className="text-sm text-gray-500">Conversation Test Console</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowConfig(!showConfig)}
                className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition"
              >
                {showConfig ? 'Hide' : 'Settings'}
              </button>
              {messages.length > 0 && (
                <button
                  onClick={clearChat}
                  className="px-4 py-2 text-sm bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition"
                >
                  Clear Chat
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Configuration Panel */}
      {showConfig && (
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Engine URL *
                </label>
                <input
                  type="text"
                  value={engineUrl}
                  onChange={(e) => setEngineUrl(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="https://your-engine.railway.app"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Merchant
                </label>
                <select
                  value={merchantId}
                  onChange={(e) => setMerchantId(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  {merchants.map(merchant => (
                    <option key={merchant.id} value={merchant.id}>
                      {merchant.business_name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Customer Phone
                </label>
                <input
                  type="text"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="+234..."
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 max-w-6xl w-full mx-auto flex flex-col overflow-hidden">
        {/* Merchant Info Bar */}
        <div className="bg-white px-4 py-3 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
              {selectedMerchant?.business_name?.charAt(0) || 'M'}
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">{selectedMerchant?.business_name || 'Select Merchant'}</h2>
              <p className="text-xs text-gray-500">Testing as {customerPhone}</p>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto bg-gray-50 p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Start a Conversation</h3>
              <p className="text-sm text-gray-500 mb-4 max-w-md">
                Send a message to test the AI conversation engine for {selectedMerchant?.business_name}
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {[
                  'Hello',
                  'I want to buy fabric',
                  'Show me ankara',
                  'Wetin be the price?',
                ].map((example) => (
                  <button
                    key={example}
                    onClick={() => setMessage(example)}
                    className="px-3 py-1.5 text-sm bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-full transition"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-end space-x-2 max-w-[70%] ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    {/* Avatar */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0 ${
                      msg.role === 'user' ? 'bg-blue-600' : 'bg-gray-600'
                    }`}>
                      {msg.role === 'user' ? 'U' : 'AI'}
                    </div>

                    {/* Message Bubble */}
                    <div>
                      <div className={`px-4 py-2 rounded-2xl ${
                        msg.role === 'user'
                          ? msg.status === 'error'
                            ? 'bg-red-500 text-white'
                            : 'bg-blue-600 text-white'
                          : 'bg-white text-gray-900 border border-gray-200'
                      }`}>
                        <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                      </div>
                      <div className={`flex items-center space-x-1 mt-1 text-xs text-gray-500 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                        <span>{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        {msg.role === 'user' && (
                          <span>
                            {msg.status === 'sending' && '⏳'}
                            {msg.status === 'sent' && '✓'}
                            {msg.status === 'error' && '⚠️'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="mx-4 mb-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-red-700">{error}</p>
              <button onClick={() => setError('')} className="ml-auto text-red-500 hover:text-red-700">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="flex items-end space-x-2">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              rows={1}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
              style={{ minHeight: '48px', maxHeight: '120px' }}
              disabled={loading}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !message.trim()}
              className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <span>Send</span>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </>
              )}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Press Enter to send • Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  )
}
