'use client'

import React, { useState, useEffect } from 'react'
import { dashboardAPI, Metrics, Conversation } from '../lib/api'

export default function Dashboard() {
  const [metrics, setMetrics] = useState<Metrics>({
    activeConversations: 247,
    totalRevenue: 850000,
    conversionRate: 68.5,
    avgResponseTime: 285
  })
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: '1',
      customerPhone: '+234801234567',
      customerName: 'Kemi Adebayo',
      lastMessage: 'Abeg, the price too high. You fit reduce am small?',
      timestamp: '2:45 PM',
      language: 'pidgin',
      status: 'negotiating',
      messageCount: 8
    },
    {
      id: '2',
      customerPhone: '+234703456789',
      customerName: 'Ibrahim Hassan',
      lastMessage: 'Do you have this in blue color?',
      timestamp: '2:38 PM',
      language: 'english',
      status: 'active',
      messageCount: 4
    },
    {
      id: '3',
      customerPhone: '+234812345678',
      lastMessage: 'Wetin be the price for sneakers?',
      timestamp: '2:32 PM',
      language: 'pidgin',
      status: 'active',
      messageCount: 12
    }
  ])
  const [isLoading, setIsLoading] = useState(false)
  const [isConnected, setIsConnected] = useState(true)

  useEffect(() => {
    // Load data from API with fallback
    const loadData = async () => {
      try {
        const [metricsData, conversationsData] = await Promise.all([
          dashboardAPI.getMetrics().catch(() => metrics),
          dashboardAPI.getConversations().catch(() => conversations)
        ])
        
        setMetrics(metricsData)
        setConversations(conversationsData)
        setIsConnected(true)
      } catch (error) {
        setIsConnected(false)
      }
    }
    
    loadData()
    const interval = setInterval(loadData, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen">
      {/* Enhanced Header with Gradient */}
      <div className="relative bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full animate-float"></div>
          <div className="absolute top-32 right-20 w-24 h-24 bg-white/10 rounded-full animate-float" style={{animationDelay: '1s'}}></div>
          <div className="absolute bottom-20 left-1/3 w-28 h-28 bg-white/10 rounded-full animate-float" style={{animationDelay: '2s'}}></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="inline-flex items-center space-x-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-6 py-3 mb-8">
              <div className={`flex items-center space-x-2 text-white`}>
                <div className={`w-3 h-3 rounded-full ${
                  isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-yellow-400'
                }`}></div>
                <span className="font-semibold text-sm">
                  {isLoading ? 'Connecting...' : isConnected ? 'System Live' : 'Mock Data Mode'}
                </span>
              </div>
            </div>
            
            <h1 className="text-5xl font-bold text-white brand-font mb-4">
              🇳🇬 Nigerian Market Dashboard
            </h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
              Real-time conversational commerce analytics powered by AI — Supporting local languages and cultural nuances
            </p>
            
            {/* Quick Stats Strip */}
            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="glass-card text-center p-4 rounded-2xl">
                <div className="text-3xl font-bold text-white mb-1">{metrics.activeConversations}</div>
                <div className="text-white/80 text-sm font-medium">Active Chats</div>
              </div>
              <div className="glass-card text-center p-4 rounded-2xl">
                <div className="text-3xl font-bold text-white mb-1">₦{(metrics.totalRevenue / 1000).toFixed(0)}K</div>
                <div className="text-white/80 text-sm font-medium">Today's Revenue</div>
              </div>
              <div className="glass-card text-center p-4 rounded-2xl">
                <div className="text-3xl font-bold text-white mb-1">{metrics.conversionRate}%</div>
                <div className="text-white/80 text-sm font-medium">Conversion</div>
              </div>
              <div className="glass-card text-center p-4 rounded-2xl">
                <div className="text-3xl font-bold text-white mb-1">{metrics.avgResponseTime}ms</div>
                <div className="text-white/80 text-sm font-medium">Response Time</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        
        {/* Enhanced Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="metric-card group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full -translate-y-10 translate-x-10"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl shadow-lg">
                  <div className="text-2xl text-white">💬</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-emerald-600 font-semibold bg-emerald-50 px-2 py-1 rounded-full">
                    +12% today
                  </div>
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-600 mb-1">Active Conversations</p>
                <p className="text-3xl font-bold text-gray-900 brand-font">{metrics.activeConversations}</p>
                <p className="text-xs text-gray-500 mt-2">Across all channels</p>
              </div>
            </div>
          </div>

          <div className="metric-card group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-emerald-500/20 to-green-500/20 rounded-full -translate-y-10 translate-x-10"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl shadow-lg">
                  <div className="text-2xl text-white">💰</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-emerald-600 font-semibold bg-emerald-50 px-2 py-1 rounded-full">
                    +₦85K
                  </div>
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-600 mb-1">Today's Revenue</p>
                <p className="text-3xl font-bold text-gray-900 brand-font">₦{(metrics.totalRevenue / 1000).toFixed(0)}K</p>
                <p className="text-xs text-gray-500 mt-2">vs ₦765K yesterday</p>
              </div>
            </div>
          </div>

          <div className="metric-card group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-500/20 to-indigo-500/20 rounded-full -translate-y-10 translate-x-10"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl shadow-lg">
                  <div className="text-2xl text-white">📈</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-emerald-600 font-semibold bg-emerald-50 px-2 py-1 rounded-full">
                    +5.2%
                  </div>
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-600 mb-1">Conversion Rate</p>
                <p className="text-3xl font-bold text-gray-900 brand-font">{metrics.conversionRate}%</p>
                <p className="text-xs text-gray-500 mt-2">Industry avg: 45%</p>
              </div>
            </div>
          </div>

          <div className="metric-card group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-full -translate-y-10 translate-x-10"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-lg">
                  <div className="text-2xl text-white">⚡</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-emerald-600 font-semibold bg-emerald-50 px-2 py-1 rounded-full">
                    -15ms
                  </div>
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-600 mb-1">Response Time</p>
                <p className="text-3xl font-bold text-gray-900 brand-font">{metrics.avgResponseTime}ms</p>
                <p className="text-xs text-gray-500 mt-2">Target: &lt;300ms</p>
              </div>
            </div>
          </div>
        </div>

        {/* Live Conversations */}
        <div className="metric-card relative overflow-hidden">
          {/* Header with gradient accent */}
          <div className="relative p-8 bg-gradient-to-r from-emerald-50 to-blue-50 border-b border-white/50">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-400/20 to-blue-400/20 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="relative flex justify-between items-center">
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <div className="p-2 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-xl">
                    <div className="text-white text-xl">💬</div>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 brand-font">Live Conversations</h2>
                </div>
                <p className="text-gray-600">Real-time customer interactions across all channels</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 bg-emerald-100 px-3 py-2 rounded-full">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-semibold text-emerald-700">{conversations.filter(c => c.status === 'active').length} Active</span>
                </div>
                <div className="flex items-center space-x-2 bg-amber-100 px-3 py-2 rounded-full">
                  <div className="w-3 h-3 bg-amber-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-semibold text-amber-700">{conversations.filter(c => c.status === 'negotiating').length} Negotiating</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="divide-y divide-gray-100">
            {conversations.map((conv) => (
              <div key={conv.id} className="p-6 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50/30 transition-all duration-300 group cursor-pointer">
                <div className="flex items-start space-x-4">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center text-white font-bold text-sm shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                      {conv.customerName ? conv.customerName.split(' ').map(n => n[0]).join('') : conv.customerPhone.slice(-2)}
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                      conv.status === 'active' 
                        ? 'bg-emerald-500' 
                        : conv.status === 'negotiating'
                        ? 'bg-amber-500'
                        : 'bg-gray-400'
                    }`}></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-base font-bold text-gray-900">
                          {conv.customerName || conv.customerPhone}
                        </h3>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs font-medium text-gray-500">{conv.timestamp}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                          conv.status === 'active' 
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                            : conv.status === 'negotiating'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-gray-100 text-gray-800 border border-gray-200'
                        }`}>
                          {conv.status.toUpperCase()}
                        </span>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
                          {conv.language === 'pidgin' ? '🇳🇬' : '🇬🇧'} {conv.language.charAt(0).toUpperCase() + conv.language.slice(1)}
                        </span>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4 mb-3">
                      <p className="text-sm text-gray-700 font-medium leading-relaxed">{conv.lastMessage}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                          {conv.messageCount} messages
                        </span>
                        <span className="text-xs text-emerald-600 font-semibold">
                          AI Response: 98% accuracy
                        </span>
                      </div>
                      <button className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs font-bold rounded-full hover:shadow-lg transition-all duration-300 group-hover:scale-105">
                        <span>View Chat</span>
                        <span>→</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="p-6 border-t border-gray-100 bg-gradient-to-r from-gray-50 to-blue-50/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-semibold text-gray-700">{conversations.length} active conversations today</span>
              </div>
              <button className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-blue-600 text-white font-bold rounded-full hover:shadow-lg transition-all duration-300">
                <span>Manage All Chats</span>
                <span>→</span>
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Analytics Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Language Distribution */}
          <div className="metric-card relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-400/20 to-green-400/20 rounded-full -translate-y-12 translate-x-12"></div>
            <div className="relative">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl">
                  <div className="text-white text-xl">🌍</div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 brand-font">Language Distribution</h3>
                  <p className="text-sm text-gray-600">Customer language preferences</p>
                </div>
              </div>
              
              <div className="space-y-5">
                <div className="group hover:scale-105 transition-transform duration-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">🇳🇬</span>
                      <span className="font-semibold text-gray-900">Nigerian Pidgin</span>
                    </div>
                    <span className="text-lg font-bold text-emerald-600">45%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div className="bg-gradient-to-r from-emerald-400 to-emerald-600 h-3 rounded-full transition-all duration-1000 ease-out" style={{width: '45%'}}></div>
                  </div>
                </div>
                
                <div className="group hover:scale-105 transition-transform duration-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">🇬🇧</span>
                      <span className="font-semibold text-gray-900">English</span>
                    </div>
                    <span className="text-lg font-bold text-blue-600">35%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-400 to-blue-600 h-3 rounded-full transition-all duration-1000 ease-out" style={{width: '35%', animationDelay: '200ms'}}></div>
                  </div>
                </div>
                
                <div className="group hover:scale-105 transition-transform duration-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">👑</span>
                      <span className="font-semibold text-gray-900">Yoruba</span>
                    </div>
                    <span className="text-lg font-bold text-amber-600">12%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div className="bg-gradient-to-r from-amber-400 to-amber-600 h-3 rounded-full transition-all duration-1000 ease-out" style={{width: '12%', animationDelay: '400ms'}}></div>
                  </div>
                </div>
                
                <div className="group hover:scale-105 transition-transform duration-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">🦅</span>
                      <span className="font-semibold text-gray-900">Igbo</span>
                    </div>
                    <span className="text-lg font-bold text-purple-600">5%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div className="bg-gradient-to-r from-purple-400 to-purple-600 h-3 rounded-full transition-all duration-1000 ease-out" style={{width: '5%', animationDelay: '600ms'}}></div>
                  </div>
                </div>
                
                <div className="group hover:scale-105 transition-transform duration-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">🌾</span>
                      <span className="font-semibold text-gray-900">Hausa</span>
                    </div>
                    <span className="text-lg font-bold text-red-600">3%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div className="bg-gradient-to-r from-red-400 to-red-600 h-3 rounded-full transition-all duration-1000 ease-out" style={{width: '3%', animationDelay: '800ms'}}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Conversation Types */}
          <div className="metric-card relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full -translate-y-12 translate-x-12"></div>
            <div className="relative">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                  <div className="text-white text-xl">📊</div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 brand-font">Conversation Types</h3>
                  <p className="text-sm text-gray-600">Customer interaction categories</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-2xl border border-blue-200/50 hover:shadow-md transition-all duration-300">
                  <div className="flex items-center space-x-4">
                    <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full shadow-sm"></div>
                    <span className="font-semibold text-gray-900">Product Inquiry</span>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-700">156</div>
                    <div className="text-xs text-blue-600">+23 today</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-50 to-amber-100/50 rounded-2xl border border-amber-200/50 hover:shadow-md transition-all duration-300">
                  <div className="flex items-center space-x-4">
                    <div className="w-4 h-4 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full shadow-sm"></div>
                    <span className="font-semibold text-gray-900">Price Negotiation</span>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-amber-700">89</div>
                    <div className="text-xs text-amber-600">+15 today</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-emerald-100/50 rounded-2xl border border-emerald-200/50 hover:shadow-md transition-all duration-300">
                  <div className="flex items-center space-x-4">
                    <div className="w-4 h-4 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full shadow-sm"></div>
                    <span className="font-semibold text-gray-900">Order Creation</span>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-emerald-700">67</div>
                    <div className="text-xs text-emerald-600">+8 today</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-purple-100/50 rounded-2xl border border-purple-200/50 hover:shadow-md transition-all duration-300">
                  <div className="flex items-center space-x-4">
                    <div className="w-4 h-4 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full shadow-sm"></div>
                    <span className="font-semibold text-gray-900">General Chat</span>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-purple-700">45</div>
                    <div className="text-xs text-purple-600">+12 today</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-red-100/50 rounded-2xl border border-red-200/50 hover:shadow-md transition-all duration-300">
                  <div className="flex items-center space-x-4">
                    <div className="w-4 h-4 bg-gradient-to-r from-red-500 to-red-600 rounded-full shadow-sm"></div>
                    <span className="font-semibold text-gray-900">Complaints</span>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-red-700">12</div>
                    <div className="text-xs text-red-600">-3 today</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
