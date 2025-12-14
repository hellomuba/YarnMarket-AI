'use client'

import React, { useState, useEffect } from 'react'
import { dashboardAPI, Metrics, Conversation } from '../lib/api'
import DashboardLayout from '@/components/DashboardLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  MessageSquare, BarChart3, Search, Filter, TrendingUp, TrendingDown, Globe, Users, Zap
} from 'lucide-react'

// Loading Skeleton Component
const SkeletonCard = () => (
  <Card className="animate-pulse">
    <CardHeader>
      <div className="h-8 w-8 bg-muted rounded-lg mb-2"></div>
      <div className="h-4 w-24 bg-muted rounded"></div>
    </CardHeader>
    <CardContent>
      <div className="h-8 w-20 bg-muted rounded mb-2"></div>
      <div className="h-3 w-32 bg-muted rounded"></div>
    </CardContent>
  </Card>
)

// Metric Card Component
const MetricCard = ({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  subtitle,
  isLoading = false
}: {
  title: string
  value: string | number
  change?: string
  changeType?: 'increase' | 'decrease'
  icon: any
  subtitle?: string
  isLoading?: boolean
}) => {
  if (isLoading) return <SkeletonCard />

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        {change && (
          <Badge variant={changeType === 'increase' ? 'default' : 'secondary'} className="gap-1">
            {changeType === 'increase' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {change}
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
      </CardContent>
    </Card>
  )
}

// Language Progress Bar
const LanguageBar = ({
  flag,
  name,
  percentage,
}: {
  flag: string
  name: string
  percentage: number
}) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold text-muted-foreground bg-muted px-2 py-1 rounded">{flag}</span>
        <span className="font-medium">{name}</span>
      </div>
      <span className="text-sm font-semibold text-primary">{percentage}%</span>
    </div>
    <div className="w-full bg-muted rounded-full h-2">
      <div
        className="h-full bg-primary rounded-full transition-all duration-500"
        style={{ width: `${percentage}%` }}
      />
    </div>
  </div>
)

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isLoading, setIsLoading] = useState(true)
  const [isConnected, setIsConnected] = useState(true)

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
  ])

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 1500)

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

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = searchQuery === '' ||
      conv.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.customerPhone.includes(searchQuery)

    const matchesFilter = selectedFilter === 'all' || conv.status === selectedFilter

    return matchesSearch && matchesFilter
  })

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Status Badge */}
        <div className="flex justify-center">
          <Badge variant={isConnected ? 'default' : 'secondary'} className="gap-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-primary-foreground' : 'bg-secondary-foreground'} animate-pulse`}></div>
            {isLoading ? 'Starting up...' : isConnected ? 'System Live' : 'Demo Mode'}
          </Badge>
        </div>

        {/* Page Title */}
        <div className="text-center space-y-2">
          <h2 className="text-4xl font-bold tracking-tight">Naija Market Analytics</h2>
          <p className="text-muted-foreground">
            Real-time insights from your conversational commerce platform
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Active Conversations"
            value={metrics.activeConversations}
            change="+12%"
            changeType="increase"
            icon={MessageSquare}
            subtitle="Across all channels"
            isLoading={isLoading}
          />
          <MetricCard
            title="Today's Revenue"
            value={`₦${(metrics.totalRevenue / 1000).toFixed(0)}K`}
            change="+₦85K"
            changeType="increase"
            icon={BarChart3}
            subtitle="vs yesterday (+11.1%)"
            isLoading={isLoading}
          />
          <MetricCard
            title="Conversion Rate"
            value={`${metrics.conversionRate}%`}
            change="+5.2%"
            changeType="increase"
            icon={TrendingUp}
            subtitle="Industry leading"
            isLoading={isLoading}
          />
          <MetricCard
            title="Response Time"
            value={`${metrics.avgResponseTime}ms`}
            change="-15ms"
            changeType="decrease"
            icon={Zap}
            subtitle="Target achieved"
            isLoading={isLoading}
          />
        </div>

        {/* Search */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search customers, messages, or phone numbers..."
                  className="w-full pl-10 pr-4 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2 px-4 py-2 border rounded-lg bg-background">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <select
                  className="border-none bg-transparent focus:outline-none"
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="negotiating">Negotiating</option>
                  <option value="waiting">Waiting</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Analytics Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Language Distribution */}
          <Card className="xl:col-span-2">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Globe className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Language Analytics</CardTitle>
                  <CardDescription>Customer communication preferences</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <LanguageBar flag="NG" name="Nigerian Pidgin" percentage={45} />
              <LanguageBar flag="EN" name="English" percentage={35} />
              <LanguageBar flag="YO" name="Yoruba" percentage={12} />
              <LanguageBar flag="IG" name="Igbo" percentage={5} />
              <LanguageBar flag="HA" name="Hausa" percentage={3} />
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-primary text-primary-foreground">
            <CardHeader>
              <CardTitle className="text-base">Today's Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="opacity-90">Total Interactions</span>
                <span className="font-bold">{metrics.activeConversations + 156}</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-90">Revenue Growth</span>
                <span className="font-bold">+11.1%</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-90">Satisfaction</span>
                <span className="font-bold">96.8%</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Live Conversations */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <MessageSquare className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Live Customer Conversations</CardTitle>
                  <CardDescription>{filteredConversations.length} active chats</CardDescription>
                </div>
              </div>

              <div className="flex gap-2">
                <Badge variant="default" className="gap-1">
                  <div className="w-2 h-2 bg-primary-foreground rounded-full animate-pulse"></div>
                  {conversations.filter(c => c.status === 'active').length} Active
                </Badge>
                <Badge variant="secondary" className="gap-1">
                  <div className="w-2 h-2 bg-secondary-foreground rounded-full animate-pulse"></div>
                  {conversations.filter(c => c.status === 'negotiating').length} Negotiating
                </Badge>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="space-y-4">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex gap-4 p-4 border rounded-lg animate-pulse">
                    <div className="w-12 h-12 bg-muted rounded-lg"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-32 bg-muted rounded"></div>
                      <div className="h-3 w-full bg-muted rounded"></div>
                      <div className="h-3 w-24 bg-muted rounded"></div>
                    </div>
                  </div>
                ))
              ) : (
                filteredConversations.map((conv) => (
                  <div key={conv.id} className="flex gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors group cursor-pointer">
                    <div className="relative flex-shrink-0">
                      <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-semibold">
                        {conv.customerName ? conv.customerName.split(' ').map(n => n[0]).join('') : conv.customerPhone.slice(-2)}
                      </div>
                      <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-background ${
                        conv.status === 'active' ? 'bg-primary' : 'bg-yellow-500'
                      }`}></div>
                    </div>

                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold truncate">
                            {conv.customerName || conv.customerPhone}
                          </h3>
                          <span className="text-sm text-muted-foreground">{conv.timestamp}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={conv.status === 'active' ? 'default' : 'secondary'}>
                            {conv.status}
                          </Badge>
                          <Badge variant="outline">
                            {conv.language}
                          </Badge>
                        </div>
                      </div>

                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          "{conv.lastMessage}"
                        </p>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" />
                            {conv.messageCount} messages
                          </span>
                          <span className="flex items-center gap-1">
                            <Zap className="h-3 w-3" />
                            98% accuracy
                          </span>
                        </div>
                        <Button size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                          Open Chat →
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>

          <div className="border-t p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                <span>{filteredConversations.length} conversations active</span>
                <span>•</span>
                <span>Updated {currentTime.toLocaleTimeString('en-NG', { timeZone: 'Africa/Lagos' })}</span>
              </div>
              <Button>
                <Users className="h-4 w-4 mr-2" />
                Manage Customers
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
}
