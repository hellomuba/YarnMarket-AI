'use client'

import React, { useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BarChart3, TrendingUp, TrendingDown, MessageSquare, DollarSign, Target, Users } from 'lucide-react'

// Mock analytics data
const analyticsData = {
  overview: {
    totalConversations: 2847,
    totalRevenue: 12500000,
    conversionRate: 68.5,
    avgOrderValue: 45000,
    customerSatisfaction: 4.8
  },
  languages: [
    { name: 'Nigerian Pidgin', code: 'NG', percentage: 45, conversations: 1281, growth: 5 },
    { name: 'English', code: 'EN', percentage: 35, conversations: 996, growth: -2 },
    { name: 'Yoruba', code: 'YO', percentage: 12, conversations: 342, growth: 8 },
    { name: 'Igbo', code: 'IG', percentage: 5, conversations: 142, growth: 12 },
    { name: 'Hausa', code: 'HA', percentage: 3, conversations: 85, growth: 3 }
  ],
  regions: [
    { name: 'Lagos', percentage: 35, customers: 998, revenue: 4375000 },
    { name: 'Abuja', percentage: 18, customers: 513, revenue: 2250000 },
    { name: 'Kano', percentage: 15, customers: 427, revenue: 1875000 },
    { name: 'Port Harcourt', percentage: 12, customers: 342, revenue: 1500000 },
    { name: 'Ibadan', percentage: 10, customers: 285, revenue: 1250000 },
    { name: 'Others', percentage: 10, customers: 285, revenue: 1250000 }
  ],
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
  icon: Icon,
  subtitle
}: {
  title: string
  value: string | number
  change?: string
  changeType?: 'increase' | 'decrease'
  icon: any
  subtitle?: string
}) => (
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

const LanguageBar = ({
  code,
  name,
  percentage,
  conversations,
  growth
}: {
  code: string
  name: string
  percentage: number
  conversations: number
  growth: number
}) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold text-muted-foreground bg-muted px-2 py-1 rounded">{code}</span>
        <span className="font-medium">{name}</span>
        <span className="text-xs text-muted-foreground">
          {conversations.toLocaleString()} conversations
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant={growth >= 0 ? 'default' : 'secondary'} className="gap-1">
          {growth >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {growth >= 0 ? '+' : ''}{growth}%
        </Badge>
        <span className="text-sm font-semibold text-primary">{percentage}%</span>
      </div>
    </div>
    <div className="w-full bg-muted rounded-full h-2">
      <div
        className="h-full bg-primary rounded-full transition-all duration-500"
        style={{ width: `${percentage}%` }}
      />
    </div>
  </div>
)

export default function Analytics() {
  const [selectedTimeframe, setSelectedTimeframe] = useState('7 days')

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `₦${(amount / 1000000).toFixed(1)}M`
    }
    return `₦${(amount / 1000).toFixed(0)}K`
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Market Analytics</h1>
            <p className="text-muted-foreground mt-2">
              Deep insights into Nigerian conversational commerce trends
            </p>
          </div>

          {/* Timeframe Selector */}
          <div className="flex gap-2">
            {['7 days', '30 days', '90 days'].map((period) => (
              <Button
                key={period}
                variant={selectedTimeframe === period ? 'default' : 'outline'}
                onClick={() => setSelectedTimeframe(period)}
                size="sm"
              >
                {period}
              </Button>
            ))}
          </div>
        </div>

        {/* Overview Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <MetricCard
            title="Total Conversations"
            value={analyticsData.overview.totalConversations.toLocaleString()}
            change="+12%"
            changeType="increase"
            icon={MessageSquare}
            subtitle="This week"
          />
          <MetricCard
            title="Total Revenue"
            value={formatCurrency(analyticsData.overview.totalRevenue)}
            change="+15%"
            changeType="increase"
            icon={DollarSign}
            subtitle="All time"
          />
          <MetricCard
            title="Conversion Rate"
            value={`${analyticsData.overview.conversionRate}%`}
            change="+5.2%"
            changeType="increase"
            icon={Target}
            subtitle="Above average"
          />
          <MetricCard
            title="Avg Order Value"
            value={formatCurrency(analyticsData.overview.avgOrderValue)}
            change="-2%"
            changeType="decrease"
            icon={TrendingUp}
            subtitle="Per transaction"
          />
          <MetricCard
            title="Satisfaction"
            value={`${analyticsData.overview.customerSatisfaction}/5.0`}
            change="+0.3"
            changeType="increase"
            icon={Users}
            subtitle="Customer rating"
          />
        </div>

        {/* Analytics Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Language Analytics */}
          <Card className="xl:col-span-2">
            <CardHeader>
              <CardTitle>Language Analytics</CardTitle>
              <CardDescription>Customer communication preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {analyticsData.languages.map((lang) => (
                <LanguageBar
                  key={lang.code}
                  code={lang.code}
                  name={lang.name}
                  percentage={lang.percentage}
                  conversations={lang.conversations}
                  growth={lang.growth}
                />
              ))}
            </CardContent>
          </Card>

          {/* Regional Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Regional Performance</CardTitle>
              <CardDescription>Revenue by state</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {analyticsData.regions.map((region) => (
                <div key={region.name} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div>
                    <p className="font-semibold">{region.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {region.percentage}% • {region.customers.toLocaleString()} customers
                    </p>
                  </div>
                  <p className="font-bold text-primary">{formatCurrency(region.revenue)}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle>Top Products</CardTitle>
            <CardDescription>Best performing items by conversation volume</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold text-sm">Product</th>
                    <th className="text-right py-3 px-4 font-semibold text-sm">Conversations</th>
                    <th className="text-right py-3 px-4 font-semibold text-sm">Revenue</th>
                    <th className="text-right py-3 px-4 font-semibold text-sm">Conversion</th>
                  </tr>
                </thead>
                <tbody>
                  {analyticsData.topProducts.map((product) => (
                    <tr key={product.name} className="border-b hover:bg-muted/50 transition-colors">
                      <td className="py-4 px-4">
                        <span className="font-medium">{product.name}</span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className="font-semibold">{product.conversations}</span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className="font-semibold text-primary">{formatCurrency(product.revenue)}</span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <Badge variant={product.conversion >= 70 ? 'default' : 'secondary'}>
                          {product.conversion}%
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
