'use client'

import React, { useState, useEffect } from 'react'
import { 
  Card, 
  Title, 
  Text, 
  Metric, 
  Flex, 
  Badge, 
  AreaChart, 
  DonutChart,
  BarChart,
  Grid,
  Col
} from '@tremor/react'
import { 
  ChatBubbleLeftRightIcon,
  CurrencyNairaIcon,
  UserGroupIcon,
  TrendingUpIcon,
  PhoneIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { motion } from 'framer-motion'
import LiveConversations from '@/components/LiveConversations'
import ConversationAnalytics from '@/components/ConversationAnalytics'
import NegotiationInsights from '@/components/NegotiationInsights'

// Mock data - replace with real API calls
const mockMetrics = {
  activeConversations: 247,
  totalRevenue: 850000,
  conversionRate: 68.5,
  avgResponseTime: 285
}

const salesData = [
  { name: 'Mon', sales: 45000 },
  { name: 'Tue', sales: 52000 },
  { name: 'Wed', sales: 48000 },
  { name: 'Thu', sales: 61000 },
  { name: 'Fri', sales: 55000 },
  { name: 'Sat', sales: 67000 },
  { name: 'Sun', sales: 43000 },
]

const languageData = [
  { name: 'Pidgin', value: 45, color: '#2C5530' },
  { name: 'English', value: 35, color: '#F4B942' },
  { name: 'Yoruba', value: 12, color: '#E63946' },
  { name: 'Igbo', value: 5, color: '#457B9D' },
  { name: 'Hausa', value: 3, color: '#F1C40F' },
]

const conversationTypes = [
  { name: 'Product Inquiry', count: 156 },
  { name: 'Price Negotiation', count: 89 },
  { name: 'Order Creation', count: 67 },
  { name: 'General Chat', count: 45 },
  { name: 'Complaints', count: 12 },
]

export default function Dashboard() {
  const [metrics, setMetrics] = useState(mockMetrics)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d')

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }, [])

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <div className=\"min-h-screen bg-gray-50\">
      {/* Header */}
      <div className=\"bg-white shadow-sm border-b border-gray-200\">
        <div className=\"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8\">
          <div className=\"flex items-center justify-between h-16\">
            <div className=\"flex items-center\">
              <h1 className=\"text-2xl font-bold text-gray-900\">
                🗣️ YarnMarket AI Dashboard
              </h1>
              <Badge color=\"emerald\" className=\"ml-3\">
                Live
              </Badge>
            </div>
            <div className=\"flex items-center space-x-4\">
              <select 
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value)}
                className=\"border border-gray-300 rounded-md px-3 py-2 text-sm\"
              >
                <option value=\"1d\">Last 24 hours</option>
                <option value=\"7d\">Last 7 days</option>
                <option value=\"30d\">Last 30 days</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <motion.div 
        className=\"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8\"
        variants={containerVariants}
        initial=\"hidden\"
        animate=\"visible\"
      >
        {/* Key Metrics */}
        <Grid numItems={1} numItemsSm={2} numItemsLg={4} className=\"gap-6 mb-8\">
          <motion.div variants={itemVariants}>
            <Card className=\"bg-gradient-to-r from-blue-500 to-blue-600 text-white\">
              <Flex alignItems=\"start\">
                <div className=\"truncate\">
                  <Text className=\"text-blue-100\">Active Conversations</Text>
                  <Metric className=\"text-white font-bold\">
                    {metrics.activeConversations.toLocaleString()}
                  </Metric>
                </div>
                <ChatBubbleLeftRightIcon className=\"h-8 w-8 text-blue-200\" />
              </Flex>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className=\"bg-gradient-to-r from-green-500 to-green-600 text-white\">
              <Flex alignItems=\"start\">
                <div className=\"truncate\">
                  <Text className=\"text-green-100\">Today's Revenue</Text>
                  <Metric className=\"text-white font-bold\">
                    ₦{metrics.totalRevenue.toLocaleString()}
                  </Metric>
                </div>
                <CurrencyNairaIcon className=\"h-8 w-8 text-green-200\" />
              </Flex>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className=\"bg-gradient-to-r from-purple-500 to-purple-600 text-white\">
              <Flex alignItems=\"start\">
                <div className=\"truncate\">
                  <Text className=\"text-purple-100\">Conversion Rate</Text>
                  <Metric className=\"text-white font-bold\">
                    {metrics.conversionRate}%
                  </Metric>
                </div>
                <TrendingUpIcon className=\"h-8 w-8 text-purple-200\" />
              </Flex>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className=\"bg-gradient-to-r from-orange-500 to-orange-600 text-white\">
              <Flex alignItems=\"start\">
                <div className=\"truncate\">
                  <Text className=\"text-orange-100\">Avg Response Time</Text>
                  <Metric className=\"text-white font-bold\">
                    {metrics.avgResponseTime}ms
                  </Metric>
                </div>
                <PhoneIcon className=\"h-8 w-8 text-orange-200\" />
              </Flex>
            </Card>
          </motion.div>
        </Grid>

        {/* Charts and Analytics */}
        <Grid numItems={1} numItemsLg={3} className=\"gap-6 mb-8\">
          <Col numColSpan={1} numColSpanLg={2}>
            <motion.div variants={itemVariants}>
              <Card>
                <Title>Sales Performance</Title>
                <Text>Daily revenue over the past week</Text>
                <AreaChart
                  className=\"mt-6\"
                  data={salesData}
                  index=\"name\"
                  categories={['sales']}
                  colors={['emerald']}
                  valueFormatter={(number) => `₦${(number / 1000).toFixed(0)}k`}
                  yAxisWidth={60}
                />
              </Card>
            </motion.div>
          </Col>

          <Col>
            <motion.div variants={itemVariants}>
              <Card>
                <Title>Language Distribution</Title>
                <Text>Customer language preferences</Text>
                <DonutChart
                  className=\"mt-6\"
                  data={languageData}
                  category=\"value\"
                  index=\"name\"
                  valueFormatter={(number) => `${number}%`}
                  colors={['emerald', 'yellow', 'red', 'blue', 'purple']}
                />
              </Card>
            </motion.div>
          </Col>
        </Grid>

        {/* Conversation Types */}
        <Grid numItems={1} numItemsLg={2} className=\"gap-6 mb-8\">
          <motion.div variants={itemVariants}>
            <Card>
              <Title>Conversation Types</Title>
              <Text>Breakdown of customer interactions</Text>
              <BarChart
                className=\"mt-6\"
                data={conversationTypes}
                index=\"name\"
                categories={['count']}
                colors={['blue']}
                valueFormatter={(number) => number.toString()}
                yAxisWidth={48}
              />
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <NegotiationInsights />
          </motion.div>
        </Grid>

        {/* Live Conversations */}
        <motion.div variants={itemVariants}>
          <Card>
            <Flex className=\"mb-6\">
              <div>
                <Title>Live Conversations</Title>
                <Text>Real-time customer interactions</Text>
              </div>
              <div className=\"flex space-x-2\">
                <Badge color=\"emerald\" icon={CheckCircleIcon}>
                  {metrics.activeConversations} Active
                </Badge>
                <Badge color=\"yellow\" icon={ExclamationTriangleIcon}>
                  12 Need Attention
                </Badge>
              </div>
            </Flex>
            <LiveConversations />
          </Card>
        </motion.div>

        {/* Detailed Analytics */}
        <motion.div variants={itemVariants} className=\"mt-8\">
          <ConversationAnalytics />
        </motion.div>
      </motion.div>
    </div>
  )
}