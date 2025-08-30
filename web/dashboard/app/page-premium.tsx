'use client'

import React, { useState, useEffect } from 'react'
import { dashboardAPI, Metrics, Conversation } from '../lib/api'

// Enhanced Icons Component with more variety
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
  ),
  Globe: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Users: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
    </svg>
  ),
  Lightning: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  Heart: () => (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
    </svg>
  )
}

// Loading Skeleton Component
const SkeletonCard = () => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 animate-pulse">
    <div className="flex items-center justify-between mb-4">
      <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
      <div className="w-16 h-6 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
    </div>
    <div className="space-y-3">
      <div className="w-24 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
      <div className="w-20 h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
      <div className="w-32 h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
    </div>
  </div>
)

// Enhanced Metric Card with Nigerian cultural elements
const PremiumMetricCard = ({ 
  title, 
  value, 
  change, 
  changeType, 
  icon, 
  color, 
  subtitle,
  isLoading = false 
}: {
  title: string
  value: string | number
  change?: string
  changeType?: 'increase' | 'decrease'
  icon: string
  color: string
  subtitle?: string
  isLoading?: boolean
}) => {
  if (isLoading) return <SkeletonCard />
  
  return (
    <div className="group relative bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 dark:border-gray-700 overflow-hidden">
      {/* Nigerian Pattern Background */}
      <div className="absolute top-0 right-0 w-32 h-32 opacity-5 dark:opacity-10">
        <div className="w-full h-full bg-gradient-to-br from-emerald-400 to-amber-400 rounded-full transform rotate-12 scale-150"></div>
      </div>
      
      {/* Floating Elements */}
      <div className="absolute top-2 right-2 w-2 h-2 bg-emerald-400 rounded-full animate-bounce opacity-60"></div>
      <div className="absolute bottom-4 left-4 w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse opacity-40"></div>
      
      <div className="relative">
        <div className="flex items-center justify-between mb-6">
          <div className={`p-4 rounded-2xl ${color} shadow-xl group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300 relative overflow-hidden`}>
            <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <span className="text-3xl relative z-10">{icon}</span>
          </div>
          {change && (
            <div className={`flex items-center space-x-2 px-4 py-2 rounded-2xl text-sm font-bold shadow-md group-hover:shadow-lg transition-all duration-300 ${
              changeType === 'increase' 
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800' 
                : 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800'
            }`}>
              {changeType === 'increase' ? <Icons.TrendUp /> : <Icons.TrendDown />}
              <span>{change}</span>
            </div>
          )}
        </div>
        
        <div className="space-y-3">
          <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">{title}</p>
          <p className="text-4xl font-black text-gray-900 dark:text-white brand-font group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-300">
            {value}
          </p>
          {subtitle && (
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>
        
        {/* Progress bar for visual appeal */}
        <div className="mt-4 w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-1000 ease-out ${
            changeType === 'increase' 
              ? 'bg-gradient-to-r from-emerald-400 to-emerald-600' 
              : 'bg-gradient-to-r from-blue-400 to-blue-600'
          }`} 
          style={{
            width: changeType === 'increase' ? '75%' : '60%',
            animationDelay: '300ms'
          }}></div>
        </div>
      </div>
    </div>
  )
}

// Enhanced Language Progress Bar
const LanguageBar = ({ 
  flag, 
  name, 
  percentage, 
  color, 
  delay = 0 
}: {
  flag: string
  name: string
  percentage: number
  color: string
  delay?: number
}) => (
  <div className="group hover:scale-[1.02] transition-all duration-300 p-4 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-700/30">
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center space-x-4">
        <div className="text-2xl group-hover:scale-110 transition-transform duration-300">{flag}</div>
        <div>
          <span className="font-bold text-gray-900 dark:text-white text-lg">{name}</span>
          <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center space-x-1">
            <Icons.Users />
            <span>{Math.round(percentage * 2.47)} customers</span>
          </div>
        </div>
      </div>
      <div className="text-right">
        <span className={`text-2xl font-black ${color} group-hover:scale-110 transition-transform duration-300`}>
          {percentage}%
        </span>
      </div>
    </div>
    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden shadow-inner">
      <div 
        className={`h-full rounded-full transition-all duration-1500 ease-out shadow-lg ${color.replace('text-', 'bg-').replace('-600', '-500')} bg-gradient-to-r`}
        style={{
          width: `${percentage}%`,
          animationDelay: `${delay}ms`
        }}
      >
        <div className="w-full h-full bg-white/30 rounded-full animate-pulse"></div>
      </div>
    </div>
  </div>
)

export default function PremiumDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isLoading, setIsLoading] = useState(true)
  
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
  
  const [isConnected, setIsConnected] = useState(true)

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setIsLoading(false), 2000)
    
    // Time updates
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    
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
    const dataInterval = setInterval(loadData, 30000)
    
    return () => {
      clearInterval(timer)
      clearInterval(dataInterval)
    }
  }, [])

  // Filter conversations
  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = searchQuery === '' || 
      conv.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.customerPhone.includes(searchQuery)
    
    const matchesFilter = selectedFilter === 'all' || conv.status === selectedFilter
    
    return matchesSearch && matchesFilter
  })

  const sidebarNavItems = [
    { name: 'Dashboard', icon: Icons.Dashboard, href: '/', current: true, badge: null },
    { name: 'Conversations', icon: Icons.Chat, href: '/conversations', current: false, badge: conversations.length },
    { name: 'Analytics', icon: Icons.Analytics, href: '/analytics', current: false, badge: null },
    { name: 'Settings', icon: Icons.Settings, href: '/settings', current: false, badge: null },
  ]

  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
      <div className="bg-gradient-to-br from-gray-50 via-blue-50/30 to-emerald-50/30 dark:from-gray-900 dark:via-blue-950/30 dark:to-emerald-950/30 min-h-screen relative overflow-hidden">
        
        {/* Nigerian Pattern Background */}
        <div className="fixed inset-0 opacity-5 dark:opacity-10 pointer-events-none">
          <div className="absolute top-10 left-10 w-96 h-96 bg-gradient-to-r from-emerald-400 to-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-float"></div>
          <div className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full mix-blend-multiply filter blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
          <div className="absolute bottom-10 left-1/3 w-96 h-96 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full mix-blend-multiply filter blur-3xl animate-float" style={{animationDelay: '4s'}}></div>
        </div>

        {/* Enhanced Sidebar */}
        <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl shadow-2xl transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-all duration-500 ease-in-out lg:translate-x-0 lg:static lg:inset-0 border-r border-white/20 dark:border-gray-700/50`}>
          
          {/* Enhanced Logo Section */}
          <div className="p-8 border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-emerald-50/80 to-blue-50/80 dark:from-emerald-900/20 dark:to-blue-900/20">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-14 h-14 bg-gradient-to-r from-emerald-500 via-blue-600 to-purple-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-2xl group-hover:shadow-emerald-500/25 transition-all duration-300">
                    🇳🇬
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full animate-pulse"></div>
                </div>
                <div>
                  <h1 className="text-2xl font-black brand-font bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                    YarnMarket AI
                  </h1>
                  <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold tracking-wide">
                    🏪 NIGERIAN COMMERCE PLATFORM
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-2 rounded-xl text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-700/50 transition-all duration-200"
              >
                <Icons.Close />
              </button>
            </div>
            
            {/* Current Time with Nigerian timezone */}
            <div className="flex items-center justify-between p-3 bg-white/50 dark:bg-gray-700/30 rounded-xl border border-white/20 dark:border-gray-600/30">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Lagos Time</span>
              </div>
              <span className="text-sm font-mono font-bold text-gray-900 dark:text-white">
                {currentTime.toLocaleTimeString('en-NG', { 
                  timeZone: 'Africa/Lagos',
                  hour12: true,
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
          </div>
          
          {/* Enhanced Navigation */}
          <nav className="p-4 space-y-2">
            {sidebarNavItems.map((item) => {
              const Icon = item.icon
              return (
                <a
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center justify-between px-4 py-4 text-sm font-semibold rounded-2xl transition-all duration-300 ${
                    item.current
                      ? 'bg-gradient-to-r from-emerald-500 via-blue-600 to-purple-600 text-white shadow-xl shadow-emerald-500/25'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-white/60 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white hover:shadow-lg'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-xl transition-all duration-300 ${
                      item.current 
                        ? 'bg-white/20' 
                        : 'group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/30'
                    }`}>
                      <Icon />
                    </div>
                    <span className="font-medium">{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="px-2 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 text-xs font-bold rounded-full">
                      {item.badge}
                    </span>
                  )}
                </a>
              )
            })}
          </nav>

          {/* Enhanced Status Section */}
          <div className="absolute bottom-8 left-4 right-4">
            <div className={`p-6 rounded-2xl shadow-xl border transition-all duration-300 ${
              isConnected 
                ? 'bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200/50 dark:from-emerald-900/20 dark:to-green-900/20 dark:border-emerald-800/50' 
                : 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200/50 dark:from-yellow-900/20 dark:to-orange-900/20 dark:border-yellow-800/50'
            }`}>
              <div className="flex items-center space-x-4 mb-3">
                <div className="relative">
                  <div className={`w-4 h-4 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-yellow-500'} animate-pulse`}></div>
                  <div className={`absolute inset-0 w-4 h-4 rounded-full ${isConnected ? 'bg-emerald-400' : 'bg-yellow-400'} animate-ping opacity-75`}></div>
                </div>
                <div>
                  <span className={`text-sm font-bold ${
                    isConnected 
                      ? 'text-emerald-700 dark:text-emerald-300' 
                      : 'text-yellow-700 dark:text-yellow-300'
                  }`}>
                    {isLoading ? 'Initializing...' : isConnected ? 'Live System' : 'Demo Mode'}
                  </span>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {isConnected ? 'All services operational' : 'Using sample data'}
                  </p>
                </div>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center space-x-1">
                <Icons.Heart />
                <span>Made with love for Naija 🇳🇬</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="lg:pl-72">
          {/* Premium Header */}
          <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-800/80 backdrop-blur-2xl shadow-lg border-b border-white/20 dark:border-gray-700/30">
            <div className="px-6 lg:px-8">
              <div className="flex justify-between items-center h-20">
                <div className="flex items-center space-x-6">
                  <button
                    onClick={() => setSidebarOpen(true)}
                    className="lg:hidden p-3 rounded-2xl text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-700/50 transition-all duration-200"
                  >
                    <Icons.Menu />
                  </button>
                  <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white brand-font flex items-center space-x-3">
                      <span>🏪</span>
                      <span className="bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Nigerian Market Hub
                      </span>
                    </h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                      Real-time conversational commerce analytics • Powered by AI
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  {/* Enhanced Theme Toggle */}
                  <button
                    onClick={() => setDarkMode(!darkMode)}
                    className="group p-3 rounded-2xl bg-white/50 dark:bg-gray-700/50 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white border border-gray-200/50 dark:border-gray-600/50 hover:shadow-lg transition-all duration-300"
                  >
                    <span className="text-xl group-hover:scale-110 transition-transform duration-300">
                      {darkMode ? '☀️' : '🌙'}
                    </span>
                  </button>
                  
                  {/* Enhanced Notifications */}
                  <button className="group relative p-3 rounded-2xl bg-white/50 dark:bg-gray-700/50 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white border border-gray-200/50 dark:border-gray-600/50 hover:shadow-lg transition-all duration-300">
                    <Icons.Bell />
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-bounce"></span>
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-400 rounded-full animate-ping"></span>
                  </button>
                  
                  {/* Enhanced User Profile */}
                  <div className="group relative">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 rounded-2xl flex items-center justify-center text-white font-bold shadow-xl hover:shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 cursor-pointer group-hover:scale-110">
                      <span className="text-xl">👤</span>
                    </div>
                    <div className="absolute top-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-gray-800 animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Premium Dashboard Content */}
          <main className="p-6 lg:p-8 space-y-10">
            
            {/* Hero Stats Section */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-emerald-100 to-blue-100 dark:from-emerald-900/30 dark:to-blue-900/30 border border-emerald-200/50 dark:border-emerald-800/30 rounded-full px-8 py-4 mb-6 shadow-lg">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-yellow-500'} animate-pulse`}></div>
                  <span className={`font-bold text-sm ${isConnected ? 'text-emerald-700 dark:text-emerald-300' : 'text-yellow-700 dark:text-yellow-300'}`}>
                    {isLoading ? 'Starting up...' : isConnected ? 'System Live' : 'Demo Mode'}
                  </span>
                </div>
              </div>
              
              <h2 className="text-5xl lg:text-6xl font-black text-gray-900 dark:text-white brand-font mb-4 leading-tight">
                <span className="bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Naija Market Analytics
                </span>
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
                Real-time insights from your conversational commerce platform 
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold"> • </span>
                Serving Nigerian customers in their preferred languages
              </p>
            </div>

            {/* Premium Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <PremiumMetricCard
                title="Active Conversations"
                value={metrics.activeConversations}
                change="+12%"
                changeType="increase"
                icon="💬"
                color="bg-gradient-to-br from-blue-500 via-cyan-500 to-blue-600"
                subtitle="Across WhatsApp, Instagram & SMS"
                isLoading={isLoading}
              />
              <PremiumMetricCard
                title="Today's Revenue"
                value={`₦${(metrics.totalRevenue / 1000).toFixed(0)}K`}
                change="+₦85K"
                changeType="increase"
                icon="💰"
                color="bg-gradient-to-br from-emerald-500 via-green-500 to-emerald-600"
                subtitle="vs ₦765K yesterday (+11.1%)"
                isLoading={isLoading}
              />
              <PremiumMetricCard
                title="Conversion Rate"
                value={`${metrics.conversionRate}%`}
                change="+5.2%"
                changeType="increase"
                icon="📈"
                color="bg-gradient-to-br from-purple-500 via-indigo-500 to-purple-600"
                subtitle="Industry leading • Avg: 45%"
                isLoading={isLoading}
              />
              <PremiumMetricCard
                title="Response Time"
                value={`${metrics.avgResponseTime}ms`}
                change="-15ms"
                changeType="decrease"
                icon="⚡"
                color="bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600"
                subtitle="Target achieved • <300ms"
                isLoading={isLoading}
              />
            </div>

            {/* Enhanced Search Section */}
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/30 p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-400/10 to-blue-400/10 rounded-full -translate-y-32 translate-x-32"></div>
              
              <div className="relative">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-6 lg:space-y-0 lg:space-x-8">
                  <div className="flex-1">
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                        <Icons.Search />
                      </div>
                      <input
                        type="text"
                        placeholder="Search customers, messages, or phone numbers..."
                        className="block w-full pl-14 pr-6 py-4 border-2 border-gray-200 dark:border-gray-600 rounded-2xl leading-6 bg-white/80 dark:bg-gray-700/80 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-300 text-lg"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-500/20 via-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-3 bg-white/80 dark:bg-gray-700/80 px-6 py-3 rounded-2xl border border-gray-200/50 dark:border-gray-600/50 shadow-lg">
                      <Icons.Filter />
                      <select
                        className="border-none bg-transparent text-gray-900 dark:text-white focus:outline-none font-semibold"
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
              </div>
            </div>

            {/* Enhanced Analytics Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              
              {/* Language Distribution - Enhanced */}
              <div className="xl:col-span-2 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/30 p-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-emerald-400/5 to-green-400/5 rounded-full -translate-y-32 -translate-x-32"></div>
                
                <div className="relative">
                  <div className="flex items-center space-x-4 mb-8">
                    <div className="p-4 bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl shadow-xl">
                      <Icons.Globe />
                    </div>
                    <div>
                      <h3 className="text-3xl font-black text-gray-900 dark:text-white brand-font">Language Analytics</h3>
                      <p className="text-gray-600 dark:text-gray-400 text-lg">Customer communication preferences across Nigeria</p>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <LanguageBar flag="🇳🇬" name="Nigerian Pidgin" percentage={45} color="text-emerald-600" delay={0} />
                    <LanguageBar flag="🇬🇧" name="English" percentage={35} color="text-blue-600" delay={200} />
                    <LanguageBar flag="👑" name="Yoruba" percentage={12} color="text-amber-600" delay={400} />
                    <LanguageBar flag="🦅" name="Igbo" percentage={5} color="text-purple-600" delay={600} />
                    <LanguageBar flag="🌾" name="Hausa" percentage={3} color="text-red-600" delay={800} />
                  </div>
                </div>
              </div>

              {/* Quick Actions Panel */}
              <div className="space-y-6">
                <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/30 p-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white brand-font mb-6">Quick Actions</h3>
                  <div className="space-y-4">
                    <button className="w-full flex items-center space-x-4 p-4 bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 rounded-2xl border border-emerald-200/50 dark:border-emerald-800/30 hover:shadow-lg transition-all duration-300 group">
                      <div className="p-2 bg-emerald-500 rounded-xl text-white group-hover:scale-110 transition-transform duration-300">
                        <Icons.Chat />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-gray-900 dark:text-white">Start New Campaign</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Broadcast to customers</p>
                      </div>
                    </button>
                    
                    <button className="w-full flex items-center space-x-4 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-2xl border border-purple-200/50 dark:border-purple-800/30 hover:shadow-lg transition-all duration-300 group">
                      <div className="p-2 bg-purple-500 rounded-xl text-white group-hover:scale-110 transition-transform duration-300">
                        <Icons.Analytics />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-gray-900 dark:text-white">Export Report</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Download analytics</p>
                      </div>
                    </button>
                    
                    <button className="w-full flex items-center space-x-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl border border-amber-200/50 dark:border-amber-800/30 hover:shadow-lg transition-all duration-300 group">
                      <div className="p-2 bg-amber-500 rounded-xl text-white group-hover:scale-110 transition-transform duration-300">
                        <Icons.Settings />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-gray-900 dark:text-white">AI Settings</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Configure responses</p>
                      </div>
                    </button>
                  </div>
                </div>
                
                {/* Daily Summary */}
                <div className="bg-gradient-to-br from-emerald-500 via-blue-600 to-purple-600 rounded-3xl shadow-2xl p-6 text-white relative overflow-hidden">
                  <div className="absolute inset-0 bg-black/10 rounded-3xl"></div>
                  <div className="relative">
                    <h3 className="text-xl font-bold mb-4 flex items-center space-x-2">
                      <span>📊</span>
                      <span>Today's Summary</span>
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-white/80">Total Interactions</span>
                        <span className="font-bold text-2xl">{metrics.activeConversations + 156}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-white/80">Revenue Growth</span>
                        <span className="font-bold text-2xl text-emerald-200">+11.1%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-white/80">Customer Satisfaction</span>
                        <span className="font-bold text-2xl text-amber-200">96.8%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Live Conversations */}
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/30 overflow-hidden">
              <div className="p-8 border-b border-gray-100/50 dark:border-gray-700/50 bg-gradient-to-r from-emerald-50/80 to-blue-50/80 dark:from-emerald-900/10 dark:to-blue-900/10">
                <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center space-y-4 lg:space-y-0">
                  <div>
                    <div className="flex items-center space-x-4 mb-3">
                      <div className="p-3 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-2xl shadow-lg">
                        <Icons.Chat />
                      </div>
                      <h2 className="text-3xl font-black text-gray-900 dark:text-white brand-font">
                        Live Customer Conversations
                      </h2>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-lg">
                      Real-time customer interactions • {filteredConversations.length} active chats
                    </p>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center space-x-3 bg-emerald-100 dark:bg-emerald-900/30 px-6 py-3 rounded-2xl shadow-lg border border-emerald-200/50 dark:border-emerald-800/30">
                      <div className="relative">
                        <div className="w-4 h-4 bg-emerald-500 rounded-full animate-pulse"></div>
                        <div className="absolute inset-0 w-4 h-4 bg-emerald-400 rounded-full animate-ping opacity-75"></div>
                      </div>
                      <span className="text-emerald-700 dark:text-emerald-300 font-bold text-lg">
                        {conversations.filter(c => c.status === 'active').length} Active
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-3 bg-amber-100 dark:bg-amber-900/30 px-6 py-3 rounded-2xl shadow-lg border border-amber-200/50 dark:border-amber-800/30">
                      <div className="relative">
                        <div className="w-4 h-4 bg-amber-500 rounded-full animate-pulse"></div>
                        <div className="absolute inset-0 w-4 h-4 bg-amber-400 rounded-full animate-ping opacity-75"></div>
                      </div>
                      <span className="text-amber-700 dark:text-amber-300 font-bold text-lg">
                        {conversations.filter(c => c.status === 'negotiating').length} Negotiating
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="divide-y divide-gray-100/50 dark:divide-gray-700/50 max-h-[600px] overflow-y-auto custom-scrollbar">
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="p-6 animate-pulse">
                      <div className="flex items-start space-x-4">
                        <div className="w-14 h-14 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
                        <div className="flex-1 space-y-3">
                          <div className="flex justify-between">
                            <div className="w-32 h-5 bg-gray-200 dark:bg-gray-700 rounded"></div>
                            <div className="w-20 h-5 bg-gray-200 dark:bg-gray-700 rounded"></div>
                          </div>
                          <div className="w-full h-12 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                          <div className="w-24 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  filteredConversations.map((conv, index) => (
                    <div key={conv.id} 
                         className="p-6 hover:bg-gradient-to-r hover:from-gray-50/80 hover:to-blue-50/50 dark:hover:from-gray-700/30 dark:hover:to-blue-900/20 transition-all duration-500 group cursor-pointer animate-fade-in"
                         style={{ animationDelay: `${index * 100}ms` }}>
                      <div className="flex items-start space-x-6">
                        <div className="relative flex-shrink-0">
                          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center text-white font-black text-lg shadow-xl group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300">
                            {conv.customerName ? conv.customerName.split(' ').map(n => n[0]).join('') : conv.customerPhone.slice(-2)}
                          </div>
                          <div className={`absolute -bottom-2 -right-2 w-6 h-6 rounded-full border-4 border-white dark:border-gray-800 shadow-lg ${
                            conv.status === 'active' 
                              ? 'bg-emerald-500 animate-pulse' 
                              : conv.status === 'negotiating'
                              ? 'bg-amber-500 animate-bounce'
                              : 'bg-gray-400'
                          }`}>
                            <div className="w-full h-full rounded-full bg-white/30 animate-ping"></div>
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0 space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-300">
                                {conv.customerName || conv.customerPhone}
                              </h3>
                              <span className="text-gray-400 dark:text-gray-500 text-lg">•</span>
                              <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                                {conv.timestamp}
                              </span>
                            </div>
                            <div className="flex items-center space-x-3">
                              <span className={`inline-flex items-center px-4 py-2 rounded-2xl text-sm font-bold border shadow-md ${
                                conv.status === 'active' 
                                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700' 
                                  : conv.status === 'negotiating'
                                  ? 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700'
                                  : 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600'
                              }`}>
                                {conv.status.toUpperCase()}
                              </span>
                              <span className="inline-flex items-center px-4 py-2 rounded-2xl text-sm font-bold bg-blue-100 text-blue-800 border border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700 shadow-md">
                                {conv.language === 'pidgin' ? '🇳🇬' : '🇬🇧'} {conv.language.charAt(0).toUpperCase() + conv.language.slice(1)}
                              </span>
                            </div>
                          </div>
                          
                          <div className="bg-gradient-to-r from-gray-50 to-blue-50/50 dark:from-gray-700/50 dark:to-blue-900/20 rounded-2xl p-6 border border-gray-100/50 dark:border-gray-600/30 shadow-inner">
                            <p className="text-gray-700 dark:text-gray-300 font-medium leading-relaxed text-lg">
                              "{conv.lastMessage}"
                            </p>
                          </div>
                          
                          <div className="flex items-center justify-between pt-2">
                            <div className="flex items-center space-x-6">
                              <span className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-full font-semibold">
                                <Icons.Chat />
                                <span>{conv.messageCount} messages</span>
                              </span>
                              <span className="flex items-center space-x-2 text-sm text-emerald-600 dark:text-emerald-400 font-bold">
                                <Icons.Lightning />
                                <span>AI: 98% accuracy</span>
                              </span>
                            </div>
                            <button className="group flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-blue-500 via-purple-600 to-blue-600 text-white font-bold rounded-2xl hover:shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105">
                              <span>Open Chat</span>
                              <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              {/* Enhanced Footer */}
              <div className="p-8 border-t border-gray-100/50 dark:border-gray-700/50 bg-gradient-to-r from-gray-50/80 to-blue-50/50 dark:from-gray-800/50 dark:to-blue-900/20">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-lg font-bold text-gray-700 dark:text-gray-300">
                      {filteredConversations.length} conversations active today
                    </span>
                    <span className="text-gray-400 dark:text-gray-500">•</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Last updated: {currentTime.toLocaleTimeString('en-NG', { timeZone: 'Africa/Lagos' })}
                    </span>
                  </div>
                  <button className="group flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-emerald-500 via-blue-600 to-purple-600 text-white font-bold rounded-2xl hover:shadow-2xl hover:shadow-emerald-500/25 transition-all duration-300 transform hover:scale-105">
                    <Icons.Users />
                    <span>Manage All Customers</span>
                    <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
                  </button>
                </div>
              </div>
            </div>
          </main>
        </div>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)}></div>
          </div>
        )}
      </div>
    </div>
  )
}
