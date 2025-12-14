'use client'

import { useState } from 'react'
import axios from 'axios'

export default function ConversationTester() {
  const [merchantId, setMerchantId] = useState('550e8400-e29b-41d4-a716-446655440000')
  const [customerPhone, setCustomerPhone] = useState('+2348012345678')
  const [message, setMessage] = useState('')
  const [response, setResponse] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [engineUrl, setEngineUrl] = useState(
    process.env.NEXT_PUBLIC_CONVERSATION_ENGINE_URL || 'http://localhost:8003'
  )

  const handleTest = async () => {
    if (!message.trim()) {
      setError('Please enter a message')
      return
    }

    setLoading(true)
    setError('')
    setResponse(null)

    try {
      const payload = {
        merchant_id: merchantId,
        customer_phone: customerPhone,
        message: message,
        message_type: 'text',
        timestamp: new Date().toISOString(),
      }

      const result = await axios.post(`${engineUrl}/conversation/process`, payload, {
        timeout: 30000,
      })

      setResponse(result.data)
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to connect to conversation engine')
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleHealthCheck = async () => {
    setLoading(true)
    setError('')
    setResponse(null)

    try {
      const result = await axios.get(`${engineUrl}/health`)
      setResponse(result.data)
    } catch (err: any) {
      setError(err.message || 'Failed to connect to conversation engine')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-3">
            🗣️ YarnMarket AI
          </h1>
          <p className="text-xl text-purple-100">Conversation Engine Tester</p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Engine URL */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Conversation Engine URL
            </label>
            <input
              type="text"
              value={engineUrl}
              onChange={(e) => setEngineUrl(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="http://localhost:8003"
            />
          </div>

          {/* Merchant ID */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Merchant ID
            </label>
            <input
              type="text"
              value={merchantId}
              onChange={(e) => setMerchantId(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="550e8400-e29b-41d4-a716-446655440000"
            />
          </div>

          {/* Customer Phone */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Customer Phone
            </label>
            <input
              type="text"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="+2348012345678"
            />
          </div>

          {/* Message */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Test Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              placeholder="Enter a message to test the conversation engine..."
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={handleTest}
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-4 rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
            >
              {loading ? 'Processing...' : 'Test Conversation'}
            </button>
            <button
              onClick={handleHealthCheck}
              disabled={loading}
              className="bg-emerald-600 text-white px-6 py-4 rounded-lg font-semibold hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
            >
              Health Check
            </button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 font-semibold">❌ Error:</p>
              <p className="text-red-700 mt-1">{error}</p>
            </div>
          )}

          {/* Response Display */}
          {response && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                ✅ Response:
              </h3>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <pre className="text-sm text-gray-800 overflow-x-auto whitespace-pre-wrap">
                  {JSON.stringify(response, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* Quick Test Examples */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Quick Test Examples:
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {[
                'Hello',
                'I want to buy fabric',
                'Show me ankara',
                'Wetin be the price?',
              ].map((example) => (
                <button
                  key={example}
                  onClick={() => setMessage(example)}
                  className="text-left px-4 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg text-sm transition-colors"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-purple-100 text-sm">
            🇳🇬 Testing YarnMarket AI Conversation Engine
          </p>
        </div>
      </div>
    </div>
  )
}
