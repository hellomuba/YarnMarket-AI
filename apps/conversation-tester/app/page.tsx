'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'

export default function ConversationTester() {
  const [merchantId, setMerchantId] = useState('550e8400-e29b-41d4-a716-446655440000')
  const [customerPhone, setCustomerPhone] = useState('+2348012345678')
  const [message, setMessage] = useState('')
  const [response, setResponse] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [engineUrl, setEngineUrl] = useState('')

  // Initialize engine URL after component mounts
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setEngineUrl(process.env.NEXT_PUBLIC_CONVERSATION_ENGINE_URL || '')
    }
  }, [])

  const handleTest = async () => {
    if (!message.trim()) {
      setError('Please enter a message')
      return
    }

    if (!engineUrl.trim()) {
      setError('Please enter conversation engine URL')
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
    if (!engineUrl.trim()) {
      setError('Please enter conversation engine URL')
      return
    }

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
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center text-white text-2xl font-bold mr-3">
              Y
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              YarnMarket AI
            </h1>
          </div>
          <p className="text-lg text-gray-600">Conversation Engine Test Console</p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Configuration</h2>
          </div>

          <div className="p-6 space-y-6">
            {/* Engine URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Conversation Engine URL *
              </label>
              <input
                type="text"
                value={engineUrl}
                onChange={(e) => setEngineUrl(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                placeholder="https://your-engine.railway.app"
              />
            </div>

            {/* Merchant ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Merchant ID
              </label>
              <input
                type="text"
                value={merchantId}
                onChange={(e) => setMerchantId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                placeholder="550e8400-e29b-41d4-a716-446655440000"
              />
            </div>

            {/* Customer Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Customer Phone
              </label>
              <input
                type="text"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                placeholder="+2348012345678"
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Test Message *
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-none"
                placeholder="Enter a message to test the conversation engine..."
              />
            </div>

            {/* Quick Examples */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quick Examples
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {[
                  'Hello',
                  'I want to buy fabric',
                  'Show me ankara',
                  'Wetin be the price?',
                ].map((example) => (
                  <button
                    key={example}
                    onClick={() => setMessage(example)}
                    className="px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-md transition"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={handleTest}
                disabled={loading}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  'Test Conversation'
                )}
              </button>
              <button
                onClick={handleHealthCheck}
                disabled={loading}
                className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-md font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Health Check
              </button>
            </div>

            {/* Error Display */}
            {error && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Error</h3>
                    <p className="mt-1 text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Response Display */}
            {response && (
              <div className="mt-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-gray-900">Response</h3>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Success
                  </span>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                  <pre className="text-sm text-gray-800 overflow-x-auto whitespace-pre-wrap font-mono">
                    {JSON.stringify(response, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            YarnMarket AI • Conversation Engine Test Console
          </p>
        </div>
      </div>
    </div>
  )
}
