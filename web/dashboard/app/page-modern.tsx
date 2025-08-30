'use client'

import React, { useState, useEffect } from 'react'
import { dashboardAPI, Metrics, Conversation } from '../lib/api'

// Icons Component
const Icons = {
  Menu: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  ),
  Close: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  Dashboard: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6a2 2 0 01-2 2H10a2 2 0 01-2-2V5zM8 15h8" />
    </svg>
  ),
  Chat: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  ),
  Analytics: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  Settings: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  Search: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  Filter: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
    </svg>
  ),
  Bell: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-1a1 1 0 011-1h1.586l4.707-4.707C10.923 6.663 12 7.109 12 8v8c0 .891-1.077 1.337-1.707.707L5.586 15z" />
    </svg>
  ),
  TrendUp: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  ),
  TrendDown: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
    </svg>
  )
}

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')
  
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
    },
    {
      id: '4',
      customerPhone: '+234807654321',
      customerName: 'Fatima Abubakar',
      lastMessage: 'Na how much be this bag?',
      timestamp: '2:20 PM',
      language: 'pidgin',
      status: 'active',
      messageCount: 3
    },
    {
      id: '5',
      customerPhone: '+234901234567',
      customerName: 'Chinedu Okafor',
      lastMessage: 'I need this delivered to Lagos today',
      timestamp: '2:15 PM',
      language: 'english',
      status: 'active',
      messageCount: 6
    }
  ])
  
  const [isLoading, setIsLoading] = useState(false)
  const [isConnected, setIsConnected] = useState(true)

  useEffect(() => {
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

  // Filter conversations based on search and filter
  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = searchQuery === '' || 
      conv.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.customerPhone.includes(searchQuery)
    
    const matchesFilter = selectedFilter === 'all' || conv.status === selectedFilter
    
    return matchesSearch && matchesFilter
  })

  const sidebarNavItems = [
    { name: 'Dashboard', icon: Icons.Dashboard, href: '/', current: true },
    { name: 'Conversations', icon: Icons.Chat, href: '/conversations', current: false },
    { name: 'Analytics', icon: Icons.Analytics, href: '/analytics', current: false },
    { name: 'Settings', icon: Icons.Settings, href: '/settings', current: false },
  ]

  const MetricCard = ({ title, value, change, changeType, icon, color, subtitle }: {
    title: string
    value: string | number
    change?: string
    changeType?: 'increase' | 'decrease'
    icon: string
    color: string
    subtitle?: string
  }) => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 dark:border-gray-700 group">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${color} shadow-lg group-hover:shadow-xl transition-shadow duration-300`}>
          <span className="text-2xl">{icon}</span>
        </div>
        {change && (
          <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold ${
            changeType === 'increase' 
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300' 
              : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
          }`}>
            {changeType === 'increase' ? <Icons.TrendUp /> : <Icons.TrendDown />}
            <span>{change}</span>
          </div>
        )}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{title}</p>
        <p className="text-3xl font-bold text-gray-900 dark:text-white brand-font">{value}</p>
        {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{subtitle}</p>}
      </div>
    </div>
  )

  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
        {/* Sidebar */}
        <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-xl transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-lg">
                🗣️
              </div>
              <div>
                <h1 className="text-xl font-bold brand-font gradient-text dark:text-white">
                  YarnMarket AI
                </h1>
                <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                  Nigerian Commerce
                </p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <Icons.Close />
            </button>
          </div>
          
          <nav className="mt-8">
            <div className="px-4 space-y-2">
              {sidebarNavItems.map((item) => {
                const Icon = item.icon
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    className={`flex items-center space-x-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                      item.current
                        ? 'bg-gradient-to-r from-emerald-500 to-blue-600 text-white shadow-lg'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <Icon />
                    <span>{item.name}</span>
                  </a>
                )
              })}
            </div>
          </nav>

          {/* Connection Status in Sidebar */}
          <div className="absolute bottom-6 left-4 right-4">
            <div className={`flex items-center space-x-3 p-4 rounded-xl ${
              isConnected 
                ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800' 
                : 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'
            }`}>
              <div className="relative">
                <div className={`w-3 h-3 rounded-full ${
                  isConnected ? 'bg-emerald-500' : 'bg-yellow-500'
                } animate-pulse`}></div>
                <div className={`absolute inset-0 w-3 h-3 rounded-full ${
                  isConnected ? 'bg-emerald-400' : 'bg-yellow-400'
                } animate-ping opacity-75`}></div>
              </div>
              <div>
                <span className={`text-sm font-semibold ${
                  isConnected 
                    ? 'text-emerald-700 dark:text-emerald-300' 
                    : 'text-yellow-700 dark:text-yellow-300'
                }`}>
                  {isLoading ? 'Connecting...' : isConnected ? 'System Live' : 'Mock Data Mode'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="lg:pl-64 flex flex-col flex-1">
          {/* Top header */}
          <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
            <div className="px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setSidebarOpen(true)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 lg:hidden"
                  >
                    <Icons.Menu />
                  </button>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white brand-font">
                      🇳🇬 Nigerian Market Dashboard
                    </h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Real-time conversational commerce analytics
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  {/* Theme toggle */}
                  <button
                    onClick={() => setDarkMode(!darkMode)}
                    className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-700 transition-colors duration-200"
                  >
                    {darkMode ? '☀️' : '🌙'}
                  </button>
                  
                  {/* Notifications */}
                  <button className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-700 transition-colors duration-200 relative">
                    <Icons.Bell />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                  </button>
                  
                  {/* User avatar */}
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer">
                    👤
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Main dashboard content */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8">
            {/* Quick stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                title="Active Conversations"
                value={metrics.activeConversations}
                change="+12%"
                changeType="increase"
                icon="💬"
                color="bg-gradient-to-br from-blue-500 to-cyan-600"
                subtitle="Across all channels"
              />
              <MetricCard
                title="Today's Revenue"
                value={`₦${(metrics.totalRevenue / 1000).toFixed(0)}K`}
                change="+₦85K"
                changeType="increase"
                icon="💰"
                color="bg-gradient-to-br from-emerald-500 to-green-600"
                subtitle="vs ₦765K yesterday"
              />
              <MetricCard
                title="Conversion Rate"
                value={`${metrics.conversionRate}%`}
                change="+5.2%"
                changeType="increase"
                icon="📈"
                color="bg-gradient-to-br from-purple-500 to-indigo-600"
                subtitle="Industry avg: 45%"
              />
              <MetricCard
                title="Response Time"
                value={`${metrics.avgResponseTime}ms`}
                change="-15ms"
                changeType="decrease"
                icon="⚡"
                color="bg-gradient-to-br from-amber-500 to-orange-600"
                subtitle="Target: <300ms"
              />
            </div>

            {/* Search and Filter Bar */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 sm:space-x-4">
                <div className="flex-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Icons.Search />
                  </div>
                  <input
                    type="text"
                    placeholder="Search conversations, customers, or messages..."
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl leading-5 bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Icons.Filter />
                  <select
                    className="border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    value={selectedFilter}
                    onChange={(e) => setSelectedFilter(e.target.value)}
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="negotiating">Negotiating</option>
                    <option value="waiting">Waiting</option>
                    <option value="escalated">Escalated</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Analytics Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Language Distribution */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl">
                    <span className="text-white text-xl">🌍</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white brand-font">Language Distribution</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Customer language preferences</p>
                  </div>
                </div>
                
                <div className="space-y-5">
                  <div className="group hover:scale-[1.02] transition-transform duration-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <span className="text-xl">🇳🇬</span>
                        <span className="font-semibold text-gray-900 dark:text-white">Nigerian Pidgin</span>
                      </div>
                      <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">45%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                      <div className="bg-gradient-to-r from-emerald-400 to-emerald-600 h-3 rounded-full transition-all duration-1000 ease-out animate-pulse" style={{width: '45%'}}></div>
                    </div>
                  </div>
                  
                  <div className="group hover:scale-[1.02] transition-transform duration-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <span className="text-xl">🇬🇧</span>
                        <span className="font-semibold text-gray-900 dark:text-white">English</span>
                      </div>
                      <span className="text-lg font-bold text-blue-600 dark:text-blue-400">35%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                      <div className="bg-gradient-to-r from-blue-400 to-blue-600 h-3 rounded-full transition-all duration-1000 ease-out" style={{width: '35%', animationDelay: '200ms'}}></div>
                    </div>
                  </div>
                  
                  <div className="group hover:scale-[1.02] transition-transform duration-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <span className="text-xl">👑</span>
                        <span className="font-semibold text-gray-900 dark:text-white">Yoruba</span>
                      </div>
                      <span className="text-lg font-bold text-amber-600 dark:text-amber-400">12%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                      <div className="bg-gradient-to-r from-amber-400 to-amber-600 h-3 rounded-full transition-all duration-1000 ease-out" style={{width: '12%', animationDelay: '400ms'}}></div>
                    </div>
                  </div>
                  
                  <div className="group hover:scale-[1.02] transition-transform duration-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <span className="text-xl">🦅</span>
                        <span className="font-semibold text-gray-900 dark:text-white">Igbo</span>
                      </div>
                      <span className="text-lg font-bold text-purple-600 dark:text-purple-400">5%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                      <div className="bg-gradient-to-r from-purple-400 to-purple-600 h-3 rounded-full transition-all duration-1000 ease-out" style={{width: '5%', animationDelay: '600ms'}}></div>
                    </div>
                  </div>
                  
                  <div className="group hover:scale-[1.02] transition-transform duration-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <span className="text-xl">🌾</span>
                        <span className="font-semibold text-gray-900 dark:text-white">Hausa</span>
                      </div>
                      <span className="text-lg font-bold text-red-600 dark:text-red-400">3%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                      <div className="bg-gradient-to-r from-red-400 to-red-600 h-3 rounded-full transition-all duration-1000 ease-out" style={{width: '3%', animationDelay: '800ms'}}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Conversation Types */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                    <span className="text-white text-xl">📊</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white brand-font">Conversation Types</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Customer interaction categories</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100/50 dark:from-blue-900/10 dark:to-blue-800/20 rounded-2xl border border-blue-200/50 dark:border-blue-800/30 hover:shadow-md transition-all duration-300">
                    <div className="flex items-center space-x-4">
                      <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full shadow-sm animate-pulse"></div>
                      <span className="font-semibold text-gray-900 dark:text-white">Product Inquiry</span>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">156</div>
                      <div className="text-xs text-blue-600 dark:text-blue-400 flex items-center">
                        <Icons.TrendUp />
                        <span className="ml-1">+23 today</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-50 to-amber-100/50 dark:from-amber-900/10 dark:to-amber-800/20 rounded-2xl border border-amber-200/50 dark:border-amber-800/30 hover:shadow-md transition-all duration-300">
                    <div className="flex items-center space-x-4">
                      <div className="w-4 h-4 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full shadow-sm animate-pulse"></div>
                      <span className="font-semibold text-gray-900 dark:text-white">Price Negotiation</span>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-amber-700 dark:text-amber-300">89</div>
                      <div className="text-xs text-amber-600 dark:text-amber-400 flex items-center">
                        <Icons.TrendUp />
                        <span className="ml-1">+15 today</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-emerald-100/50 dark:from-emerald-900/10 dark:to-emerald-800/20 rounded-2xl border border-emerald-200/50 dark:border-emerald-800/30 hover:shadow-md transition-all duration-300">
                    <div className="flex items-center space-x-4">
                      <div className="w-4 h-4 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full shadow-sm animate-pulse"></div>
                      <span className="font-semibold text-gray-900 dark:text-white">Order Creation</span>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">67</div>
                      <div className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center">
                        <Icons.TrendUp />
                        <span className="ml-1">+8 today</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-purple-100/50 dark:from-purple-900/10 dark:to-purple-800/20 rounded-2xl border border-purple-200/50 dark:border-purple-800/30 hover:shadow-md transition-all duration-300">
                    <div className="flex items-center space-x-4">
                      <div className="w-4 h-4 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full shadow-sm animate-pulse"></div>
                      <span className="font-semibold text-gray-900 dark:text-white">General Chat</span>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">45</div>
                      <div className="text-xs text-purple-600 dark:text-purple-400 flex items-center">
                        <Icons.TrendUp />
                        <span className="ml-1">+12 today</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-red-100/50 dark:from-red-900/10 dark:to-red-800/20 rounded-2xl border border-red-200/50 dark:border-red-800/30 hover:shadow-md transition-all duration-300">
                    <div className="flex items-center space-x-4">
                      <div className="w-4 h-4 bg-gradient-to-r from-red-500 to-red-600 rounded-full shadow-sm"></div>
                      <span className="font-semibold text-gray-900 dark:text-white">Complaints</span>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-red-700 dark:text-red-300">12</div>
                      <div className="text-xs text-red-600 dark:text-red-400 flex items-center">
                        <Icons.TrendDown />
                        <span className="ml-1">-3 today</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Conversations */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="p-6 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-900/10 dark:to-blue-900/10">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="p-2 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-xl">
                        <Icons.Chat />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white brand-font">Live Conversations</h2>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">Real-time customer interactions • {filteredConversations.length} results</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2 bg-emerald-100 dark:bg-emerald-900/20 px-3 py-2 rounded-full">
                      <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                        {conversations.filter(c => c.status === 'active').length} Active
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 bg-amber-100 dark:bg-amber-900/20 px-3 py-2 rounded-full">
                      <div className="w-3 h-3 bg-amber-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-semibold text-amber-700 dark:text-amber-300">
                        {conversations.filter(c => c.status === 'negotiating').length} Negotiating
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="divide-y divide-gray-100 dark:divide-gray-700 max-h-96 overflow-y-auto">
                {filteredConversations.map((conv) => (
                  <div key={conv.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-300 group cursor-pointer">
                    <div className="flex items-start space-x-4">
                      <div className="relative flex-shrink-0">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center text-white font-bold text-sm shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                          {conv.customerName ? conv.customerName.split(' ').map(n => n[0]).join('') : conv.customerPhone.slice(-2)}
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-gray-800 ${
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
                            <h3 className="text-base font-bold text-gray-900 dark:text-white">
                              {conv.customerName || conv.customerPhone}
                            </h3>
                            <span className="text-xs text-gray-400 dark:text-gray-500">•</span>
                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{conv.timestamp}</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${
                              conv.status === 'active' 
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800' 
                                : conv.status === 'negotiating'
                                ? 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800'
                                : 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600'
                            }`}>
                              {conv.status.toUpperCase()}
                            </span>
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800">
                              {conv.language === 'pidgin' ? '🇳🇬' : '🇬🇧'} {conv.language.charAt(0).toUpperCase() + conv.language.slice(1)}
                            </span>
                          </div>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 mb-3">
                          <p className="text-sm text-gray-700 dark:text-gray-300 font-medium leading-relaxed">{conv.lastMessage}</p>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                              {conv.messageCount} messages
                            </span>
                            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
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
            </div>
          </main>
        </div>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="fixed inset-0 bg-black opacity-50" onClick={() => setSidebarOpen(false)}></div>
          </div>
        )}
      </div>
    </div>
  )
}
