const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost'

// Helper function to remove trailing slashes
const removeTrailingSlash = (url: string | undefined): string => {
  if (!url) return ''
  return url.replace(/\/+$/, '')
}

// API endpoints
const ENDPOINTS = {
  conversationEngine: `${API_BASE_URL}:8003`,
  merchantApi: `${API_BASE_URL}:3005`,
  analyticsService: `${API_BASE_URL}:8004`,
  webhookHandler: `${API_BASE_URL}:8082`,
  dashboardApi: removeTrailingSlash(process.env.NEXT_PUBLIC_DASHBOARD_API_URL) || `${API_BASE_URL}:8005`
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

export interface ProductVariant {
  id?: number
  sku?: string
  variant_name: string
  colour?: string
  size?: string
  price: number
  stock_quantity: number
  availability: boolean
  image_url?: string
  metadata?: Record<string, any>
}

export interface Product {
  id?: number
  merchant_id?: number
  name: string
  description?: string
  brand?: string
  category: 'Clothing' | 'Electronics' | 'Food & Groceries' | 'Beauty & Personal Care' |
            'Home & Living' | 'Sports & Outdoors' | 'Books & Media' | 'Toys & Games' | 'Other'
  product_type: 'simple' | 'advanced'
  base_price: number
  currency: string
  ean?: string
  image_url?: string
  metadata?: Record<string, any>
  is_active: boolean
  variants?: ProductVariant[]
  created_at?: string

  // Legacy fields for backward compatibility
  price?: number
  in_stock?: boolean
  stock_quantity?: number
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

  async getProducts(merchantId: number = 1): Promise<Product[]> {
    try {
      const data = await this.fetchWithTimeout(`${ENDPOINTS.dashboardApi}/api/products?merchant_id=${merchantId}`)

      // Ensure variants is always an array
      return data.map((product: any) => ({
        ...product,
        variants: Array.isArray(product.variants)
          ? product.variants
          : (typeof product.variants === 'string'
              ? JSON.parse(product.variants)
              : [])
      }))
    } catch (error) {
      console.warn('Failed to fetch products from API:', error)
      return []
    }
  }

  async createProduct(product: Omit<Product, 'id' | 'created_at'>): Promise<Product> {
    try {
      const data = await this.fetchWithTimeout(
        `${ENDPOINTS.dashboardApi}/api/products`,
        {
          method: 'POST',
          body: JSON.stringify(product)
        }
      )
      return data
    } catch (error) {
      console.error('Failed to create product:', error)
      throw error
    }
  }

  async updateProduct(productId: number, product: Omit<Product, 'id' | 'created_at'>): Promise<Product> {
    try {
      const data = await this.fetchWithTimeout(
        `${ENDPOINTS.dashboardApi}/api/products/${productId}`,
        {
          method: 'PUT',
          body: JSON.stringify(product)
        }
      )
      return data
    } catch (error) {
      console.error('Failed to update product:', error)
      throw error
    }
  }

  async deleteProduct(productId: number, merchantId: number = 1): Promise<void> {
    try {
      await this.fetchWithTimeout(
        `${ENDPOINTS.dashboardApi}/api/products/${productId}?merchant_id=${merchantId}`,
        { method: 'DELETE' }
      )
    } catch (error) {
      console.error('Failed to delete product:', error)
      throw error
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