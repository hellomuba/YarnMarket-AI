const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost'

// API endpoints
const ENDPOINTS = {
  conversationEngine: `${API_BASE_URL}:8003`,
  merchantApi: `${API_BASE_URL}:3005`, 
  analyticsService: `${API_BASE_URL}:8004`,
  webhookHandler: `${API_BASE_URL}:8082`
}

// Types
export interface Conversation {
  id: string
  customerPhone: string
  customerName?: string
  lastMessage: string
  timestamp: string
  language: string
  status: 'active' | 'negotiating' | 'waiting' | 'escalated'
  messageCount: number
}

export interface Metrics {
  activeConversations: number
  totalRevenue: number
  conversionRate: number
  avgResponseTime: number
}

export interface LanguageStats {
  [language: string]: number
}

// API Functions
export class DashboardAPI {
  private async fetchWithTimeout(url: string, options: RequestInit = {}, timeout = 5000) {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      })
      
      clearTimeout(timeoutId)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      return response.json()
    } catch (error) {
      clearTimeout(timeoutId)
      console.error(`API call failed for ${url}:`, error)
      throw error
    }
  }

  async getMetrics(): Promise<Metrics> {
    try {
      // Try to get metrics from analytics service
      const data = await this.fetchWithTimeout(`${ENDPOINTS.analyticsService}/api/metrics`)
      return data
    } catch (error) {
      // Fallback to mock data
      console.warn('Failed to fetch metrics from API, using mock data')
      return {
        activeConversations: Math.floor(Math.random() * 100) + 200,
        totalRevenue: Math.floor(Math.random() * 100000) + 800000,
        conversionRate: Math.floor(Math.random() * 20) + 60,
        avgResponseTime: Math.floor(Math.random() * 200) + 200
      }
    }
  }

  async getConversations(): Promise<Conversation[]> {
    try {
      // Try to get conversations from conversation engine
      const data = await this.fetchWithTimeout(`${ENDPOINTS.conversationEngine}/api/conversations`)
      return data
    } catch (error) {
      // Fallback to mock data
      console.warn('Failed to fetch conversations from API, using mock data')
      return [
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
          lastMessage: 'This thing no good at all! I wan return am!',
          timestamp: '2:32 PM',
          language: 'pidgin',
          status: 'escalated',
          messageCount: 12
        }
      ]
    }
  }

  async getLanguageStats(): Promise<LanguageStats> {
    try {
      const data = await this.fetchWithTimeout(`${ENDPOINTS.analyticsService}/api/language-stats`)
      return data
    } catch (error) {
      console.warn('Failed to fetch language stats from API, using mock data')
      return {
        'Nigerian Pidgin': 45,
        'English': 35,
        'Yoruba': 12,
        'Igbo': 5,
        'Hausa': 3
      }
    }
  }

  async checkHealth(): Promise<boolean> {
    try {
      await Promise.all([
        this.fetchWithTimeout(`${ENDPOINTS.conversationEngine}/health`),
        this.fetchWithTimeout(`${ENDPOINTS.analyticsService}/health`),
      ])
      return true
    } catch {
      return false
    }
  }
}

export const dashboardAPI = new DashboardAPI()