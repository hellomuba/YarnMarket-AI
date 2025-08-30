'use client'

import React, { useState, useEffect } from 'react'
import { BarChart3, TrendingUp, TrendingDown, Users, MessageSquare, ShoppingCart, Clock, Globe, Target, Zap } from 'lucide-react'

// Icons Component
const Icons = {
  BarChart: () => <BarChart3 className="w-5 h-5" />,
  TrendUp: () => <TrendingUp className="w-4 h-4" />,
  TrendDown: () => <TrendingDown className="w-4 h-4" />,
  Users: () => <Users className="w-5 h-5" />,
  Message: () => <MessageSquare className="w-5 h-5" />,
  Cart: () => <ShoppingCart className="w-5 h-5" />,
  Clock: () => <Clock className="w-5 h-5" />,
  Globe: () => <Globe className="w-5 h-5" />,
  Target: () => <Target className="w-5 h-5" />,
  Zap: () => <Zap className="w-5 h-5" />
}

// Mock analytics data
const analyticsData = {
  overview: {
    totalConversations: 2847,
    totalRevenue: 12500000, // ₦12.5M
    conversionRate: 68.5,
    avgOrderValue: 45000,
    customerSatisfaction: 4.8
  },
  timeframes: [
    { period: '7 days', conversations: 247, revenue: 850000, growth: 12 },
    { period: '30 days', conversations: 1024, revenue: 3400000, growth: 8 },
    { period: '90 days', conversations: 2847, revenue: 12500000, growth: 15 }
  ],
  languages: [
    { name: 'Nigerian Pidgin', code: 'pidgin', percentage: 45, conversations: 1281, flag: '🇳🇬', growth: 5 },
    { name: 'English', code: 'english', percentage: 35, conversations: 996, flag: '🇬🇧', growth: -2 },
    { name: 'Yoruba', code: 'yoruba', percentage: 12, conversations: 342, flag: '👑', growth: 8 },
    { name: 'Igbo', code: 'igbo', percentage: 5, conversations: 142, flag: '🦅', growth: 12 },
    { name: 'Hausa', code: 'hausa', percentage: 3, conversations: 85, flag: '🌾', growth: 3 }
  ],
  regions: [
    { name: 'Lagos', percentage: 35, customers: 998, revenue: 4375000 },
    { name: 'Abuja', percentage: 18, customers: 513, revenue: 2250000 },
    { name: 'Kano', percentage: 15, customers: 427, revenue: 1875000 },
    { name: 'Port Harcourt', percentage: 12, customers: 342, revenue: 1500000 },
    { name: 'Ibadan', percentage: 10, customers: 285, revenue: 1250000 },
    { name: 'Others', percentage: 10, customers: 285, revenue: 1250000 }
  ],
  hourlyActivity: Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    conversations: Math.floor(Math.random() * 100) + 20,
    sales: Math.floor(Math.random() * 50000) + 10000
  })),
  topProducts: [
    { name: 'Ankara Fabric Bundle', conversations: 156, revenue: 780000, conversion: 72 },
    { name: 'Nike Air Max Sneakers', conversations: 134, revenue: 670000, conversion: 68 },
    { name: 'Samsung Galaxy Phone', conversations: 98, revenue: 1960000, conversion: 85 },
    { name: 'Traditional Agbada', conversations: 87, revenue: 435000, conversion: 65 },
    { name: 'Leather Handbag', conversations: 76, revenue: 380000, conversion: 58 }
  ]
}

const MetricCard = ({ 
  title, 
  value, 
  change, 
  changeType, 
  icon, 
  color, 
  subtitle 
}: {
  title: string
  value: string | number
  change?: string
  changeType?: 'increase' | 'decrease'
  icon: React.ReactNode
  color: string
  subtitle?: string
}) => (
  <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/30 p-6 relative overflow-hidden group hover:shadow-3xl transition-all duration-500">
    <div className="absolute top-0 right-0 w-32 h-32 opacity-5 dark:opacity-10">
      <div className="w-full h-full bg-gradient-to-br from-emerald-400 to-blue-400 rounded-full transform rotate-12 scale-150"></div>
    </div>
    
    <div className="relative">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-2xl ${color} shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300`}>
          {icon}
        </div>
        {change && (
          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-bold ${
            changeType === 'increase' 
              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' 
              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
          }`}>
            {changeType === 'increase' ? <Icons.TrendUp /> : <Icons.TrendDown />}
            <span>{change}</span>
          </div>
        )}
      </div>
      
      <div className="space-y-2">
        <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">{title}</p>
        <p className="text-3xl font-black text-gray-900 dark:text-white brand-font group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-300">
          {value}
        </p>
        {subtitle && (
          <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
        )}
      </div>
    </div>
  </div>
)

const ProgressBar = ({ 
  label, 
  value, 
  total, 
  color, 
  flag, 
  subtitle 
}: {
  label: string
  value: number
  total: number
  color: string
  flag?: string
  subtitle?: string
}) => {
  const percentage = (value / total) * 100
  
  return (
    <div className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 rounded-2xl transition-all duration-300 group">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          {flag && <span className="text-2xl group-hover:scale-110 transition-transform duration-300">{flag}</span>}
          <div>
            <span className="font-bold text-gray-900 dark:text-white">{label}</span>
            {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>}
          </div>
        </div>
        <div className="text-right">
          <span className={`text-xl font-black ${color}`}>{percentage.toFixed(1)}%</span>
          <p className="text-xs text-gray-500 dark:text-gray-400">{value.toLocaleString()}</p>
        </div>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-1000 ease-out ${color.replace('text-', 'bg-')}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  )
}

export default function Analytics() {
  const [selectedTimeframe, setSelectedTimeframe] = useState('7 days')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 1500)
  }, [])

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `₦${(amount / 1000000).toFixed(1)}M`
    }
    return `₦${(amount / 1000).toFixed(0)}K`
  }

  return (
    <div className="bg-gradient-to-br from-gray-50 via-blue-50/30 to-emerald-50/30 dark:from-gray-900 dark:via-blue-950/30 dark:to-emerald-950/30 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 pt-32">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-black text-gray-900 dark:text-white brand-font flex items-center space-x-3">
                <span>📊</span>
                <span className="bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Market Analytics
                </span>
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">
                Deep insights into Nigerian conversational commerce trends
              </p>
            </div>
            
            {/* Timeframe Selector */}
            <div className="flex items-center space-x-2 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl p-2 border border-white/20 dark:border-gray-700/30 shadow-lg">
              {analyticsData.timeframes.map((timeframe) => (
                <button
                  key={timeframe.period}
                  onClick={() => setSelectedTimeframe(timeframe.period)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                    selectedTimeframe === timeframe.period
                      ? 'bg-emerald-500 text-white shadow-lg'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                  }`}
                >
                  {timeframe.period}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Overview Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <MetricCard
            title="Total Conversations"
            value={analyticsData.overview.totalConversations.toLocaleString()}
            change="+12%"
            changeType="increase"
            icon={<Icons.Message />}
            color="bg-gradient-to-br from-blue-500 to-cyan-600"
            subtitle="This week"
          />
          <MetricCard
            title="Total Revenue"
            value={formatCurrency(analyticsData.overview.totalRevenue)}
            change="+15%"
            changeType="increase"
            icon={<Icons.Cart />}
            color="bg-gradient-to-br from-emerald-500 to-green-600"
            subtitle="All time"
          />
          <MetricCard
            title="Conversion Rate"
            value={`${analyticsData.overview.conversionRate}%`}
            change="+5.2%"
            changeType="increase"
            icon={<Icons.Target />}
            color="bg-gradient-to-br from-purple-500 to-indigo-600"
            subtitle="Above average"
          />
          <MetricCard
            title="Avg Order Value"
            value={formatCurrency(analyticsData.overview.avgOrderValue)}
            change="-2%"
            changeType="decrease"
            icon={<Icons.TrendUp />}
            color="bg-gradient-to-br from-amber-500 to-orange-600"
            subtitle="Per transaction"
          />
          <MetricCard
            title="Satisfaction"
            value={`${analyticsData.overview.customerSatisfaction}/5.0`}
            change="+0.3"
            changeType="increase"
            icon={<Icons.Users />}
            color="bg-gradient-to-br from-rose-500 to-pink-600"
            subtitle="Customer rating"
          />
        </div>

        {/* Analytics Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
          
          {/* Language Distribution */}
          <div className="xl:col-span-2 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/30 p-8">
            <div className="flex items-center space-x-4 mb-6">
              <div className="p-3 bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl shadow-lg">
                <Icons.Globe />
              </div>
              <div>
                <h3 className="text-2xl font-black text-gray-900 dark:text-white brand-font">Language Analytics</h3>
                <p className="text-gray-600 dark:text-gray-400">Customer communication preferences</p>
              </div>
            </div>
            
            <div className="space-y-4">
              {analyticsData.languages.map((lang) => (
                <ProgressBar
                  key={lang.code}
                  label={lang.name}
                  value={lang.conversations}
                  total={analyticsData.overview.totalConversations}
                  color={`text-${lang.code === 'pidgin' ? 'emerald' : lang.code === 'english' ? 'blue' : lang.code === 'yoruba' ? 'amber' : lang.code === 'igbo' ? 'purple' : 'red'}-600`}
                  flag={lang.flag}
                  subtitle={`${lang.conversations.toLocaleString()} conversations • +${lang.growth}% growth`}
                />
              ))}
            </div>
          </div>

          {/* Regional Distribution */}
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/30 p-8">
            <div className="flex items-center space-x-4 mb-6">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-lg">
                <Icons.Globe />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Regional Performance</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Revenue by state</p>
              </div>
            </div>
            
            <div className="space-y-4">
              {analyticsData.regions.map((region, index) => (
                <div key={region.name} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700/30 rounded-xl transition-colors duration-300">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${
                      index === 0 ? 'from-emerald-400 to-emerald-600' :
                      index === 1 ? 'from-blue-400 to-blue-600' :
                      index === 2 ? 'from-purple-400 to-purple-600' :
                      index === 3 ? 'from-amber-400 to-amber-600' :
                      'from-gray-400 to-gray-600'
                    }`}></div>
                    <span className="font-semibold text-gray-900 dark:text-white">{region.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900 dark:text-white">{formatCurrency(region.revenue)}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{region.percentage}% • {region.customers.toLocaleString()} customers</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Products Analysis */}
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/30 p-8 mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl shadow-lg">
              <Icons.BarChart />
            </div>
            <div>
              <h3 className="text-2xl font-black text-gray-900 dark:text-white brand-font">Top Products</h3>
              <p className="text-gray-600 dark:text-gray-400">Best performing items by conversation volume</p>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Product</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Conversations</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Revenue</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Conversion</th>
                </tr>
              </thead>
              <tbody>
                {analyticsData.topProducts.map((product, index) => (
                  <tr key={product.name} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors duration-200">
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-2 h-8 rounded-full bg-gradient-to-b ${
                          index === 0 ? 'from-emerald-400 to-emerald-600' :
                          index === 1 ? 'from-blue-400 to-blue-600' :
                          index === 2 ? 'from-purple-400 to-purple-600' :
                          index === 3 ? 'from-amber-400 to-amber-600' :
                          'from-gray-400 to-gray-600'
                        }`}></div>
                        <span className="font-semibold text-gray-900 dark:text-white">{product.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className="font-bold text-gray-900 dark:text-white">{product.conversations}</span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(product.revenue)}</span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          product.conversion >= 70 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' :
                          product.conversion >= 60 ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' :
                          'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                        }`}>
                          {product.conversion}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Activity Heatmap */}
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/30 p-8">
          <div className="flex items-center space-x-4 mb-6">
            <div className="p-3 bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl shadow-lg">
              <Icons.Clock />
            </div>
            <div>
              <h3 className="text-2xl font-black text-gray-900 dark:text-white brand-font">24-Hour Activity</h3>
              <p className="text-gray-600 dark:text-gray-400">Customer engagement patterns throughout the day</p>
            </div>
          </div>
          
          <div className="grid grid-cols-12 lg:grid-cols-24 gap-2">
            {analyticsData.hourlyActivity.map((hour) => {
              const intensity = Math.min(hour.conversations / 100, 1)
              return (
                <div
                  key={hour.hour}
                  className="group relative aspect-square rounded-lg transition-all duration-300 hover:scale-110 cursor-pointer"
                  style={{
                    backgroundColor: `rgba(34, 197, 94, ${intensity})`,
                    border: intensity > 0.7 ? '2px solid rgb(34, 197, 94)' : '1px solid rgba(34, 197, 94, 0.3)'
                  }}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-bold text-white opacity-80">
                      {hour.hour}
                    </span>
                  </div>
                  
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap z-10">
                    <p className="font-semibold">{hour.hour}:00 - {hour.hour + 1}:00</p>
                    <p>{hour.conversations} conversations</p>
                    <p>{formatCurrency(hour.sales)} in sales</p>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                  </div>
                </div>
              )
            })}
          </div>
          
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 dark:text-gray-400">Less active</span>
              <div className="flex space-x-1">
                {[0.2, 0.4, 0.6, 0.8, 1.0].map((opacity) => (
                  <div
                    key={opacity}
                    className="w-4 h-4 rounded-sm"
                    style={{ backgroundColor: `rgba(34, 197, 94, ${opacity})` }}
                  ></div>
                ))}
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">More active</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Peak hours: 2PM - 6PM (Lagos time)
            </p>
          </div>
        </div>
        
      </div>
    </div>
  )
}
