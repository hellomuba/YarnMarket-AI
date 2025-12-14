// API Client for YarnMarket AI Dashboard
// This provides centralized API calls to the backend services

import { Merchant, Message, Conversation, QueueStatus, SystemMetrics } from './types';

const API_BASE_URL = (typeof process !== 'undefined' && process.env?.REACT_APP_API_URL) || 'http://localhost:8000';

// Generic API request function with error handling
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error);
    throw error;
  }
}

// Merchants API
export const merchantsApi = {
  // Get all merchants
  getAll: async (): Promise<Merchant[]> => {
    return apiRequest<Merchant[]>('/merchants');
  },

  // Get specific merchant by ID
  getById: async (id: string): Promise<Merchant> => {
    return apiRequest<Merchant>(`/merchants/${id}`);
  },

  // Create new merchant
  create: async (merchantData: Partial<Merchant>): Promise<Merchant> => {
    return apiRequest<Merchant>('/merchants', {
      method: 'POST',
      body: JSON.stringify(merchantData),
    });
  },

  // Update merchant
  update: async (id: string, merchantData: Partial<Merchant>): Promise<Merchant> => {
    return apiRequest<Merchant>(`/merchants/${id}`, {
      method: 'PUT',
      body: JSON.stringify(merchantData),
    });
  },

  // Delete merchant
  delete: async (id: string): Promise<void> => {
    return apiRequest<void>(`/merchants/${id}`, {
      method: 'DELETE',
    });
  },

  // Get merchant metrics
  getMetrics: async (id: string): Promise<any> => {
    return apiRequest<any>(`/merchants/${id}/metrics`);
  },
};

// Messages API
export const messagesApi = {
  // Get messages with optional filters
  getAll: async (params?: {
    merchant_id?: string;
    limit?: number;
    offset?: number;
    status?: string;
  }): Promise<{ messages: Message[]; total: number }> => {
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }

    const endpoint = `/messages${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    return apiRequest<{ messages: Message[]; total: number }>(endpoint);
  },

  // Get specific message
  getById: async (id: string): Promise<Message> => {
    return apiRequest<Message>(`/messages/${id}`);
  },

  // Send message
  send: async (messageData: {
    to: string;
    text: string;
    merchant_id: string;
    type?: string;
  }): Promise<Message> => {
    return apiRequest<Message>('/messages/send', {
      method: 'POST',
      body: JSON.stringify(messageData),
    });
  },

  // Update message status
  updateStatus: async (id: string, status: string): Promise<Message> => {
    return apiRequest<Message>(`/messages/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  // Retry failed message
  retry: async (id: string): Promise<Message> => {
    return apiRequest<Message>(`/messages/${id}/retry`, {
      method: 'POST',
    });
  },
};

// Conversations API
export const conversationsApi = {
  // Get conversations
  getAll: async (params?: {
    merchant_id?: string;
    limit?: number;
    offset?: number;
    status?: string;
  }): Promise<{ conversations: Conversation[]; total: number }> => {
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }

    const endpoint = `/conversations${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    return apiRequest<{ conversations: Conversation[]; total: number }>(endpoint);
  },

  // Get specific conversation
  getById: async (id: string): Promise<Conversation> => {
    return apiRequest<Conversation>(`/conversations/${id}`);
  },

  // Get conversation messages
  getMessages: async (id: string): Promise<Message[]> => {
    return apiRequest<Message[]>(`/conversations/${id}/messages`);
  },

  // Archive conversation
  archive: async (id: string): Promise<void> => {
    return apiRequest<void>(`/conversations/${id}/archive`, {
      method: 'POST',
    });
  },

  // Get conversation analytics
  getAnalytics: async (id: string): Promise<any> => {
    return apiRequest<any>(`/conversations/${id}/analytics`);
  },
};

// Queue Status API
export const queueApi = {
  // Get queue status
  getStatus: async (): Promise<QueueStatus> => {
    return apiRequest<QueueStatus>('/queue/status');
  },

  // Get queue metrics
  getMetrics: async (): Promise<any> => {
    return apiRequest<any>('/queue/metrics');
  },

  // Retry failed jobs
  retryFailed: async (): Promise<{ retried: number }> => {
    return apiRequest<{ retried: number }>('/queue/retry-failed', {
      method: 'POST',
    });
  },

  // Clear queue
  clear: async (queueName: string): Promise<{ cleared: number }> => {
    return apiRequest<{ cleared: number }>(`/queue/${queueName}/clear`, {
      method: 'POST',
    });
  },
};

// System API
export const systemApi = {
  // Get system metrics
  getMetrics: async (): Promise<SystemMetrics> => {
    return apiRequest<SystemMetrics>('/system/metrics');
  },

  // Get system health
  getHealth: async (): Promise<{ status: string; checks: Record<string, any> }> => {
    return apiRequest<{ status: string; checks: Record<string, any> }>('/system/health');
  },

  // Get system info
  getInfo: async (): Promise<any> => {
    return apiRequest<any>('/system/info');
  },
};

// RAG System API (Enhanced endpoints)
export const ragApi = {
  // Index merchant catalog
  indexCatalog: async (merchantId: string): Promise<{ 
    status: string; 
    indexed_products: number; 
    merchant_id: string; 
    timestamp: number; 
  }> => {
    return apiRequest<{ 
      status: string; 
      indexed_products: number; 
      merchant_id: string; 
      timestamp: number; 
    }>(`/merchant/${merchantId}/catalog/index`, {
      method: 'POST',
    });
  },

  // Search products
  search: async (params: {
    query: string;
    merchant_id: string;
    limit?: number;
  }): Promise<any> => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });

    return apiRequest<any>(`/rag/search?${searchParams.toString()}`);
  },

  // Analyze image
  analyzeImage: async (formData: FormData, merchantId: string): Promise<any> => {
    const url = `${API_BASE_URL}/image/analyze?merchant_id=${merchantId}`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Image analysis failed:', error);
      throw error;
    }
  },
};

// Conversation Engine API (Enhanced endpoints)
export const conversationEngineApi = {
  // Process conversation message
  processMessage: async (payload: {
    text?: string;
    image?: string;
    type: string;
    merchant_id: string;
    conversation_id?: string;
    test_mode: boolean;
    language?: string;
  }): Promise<{
    messageId: string;
    text: string;
    timestamp: number;
    quickReplies?: string[];
    productRecommendations?: any[];
    ragInfo?: any;
    conversationId: string;
    metadata: Record<string, any>;
  }> => {
    return apiRequest<{
      messageId: string;
      text: string;
      timestamp: number;
      quickReplies?: string[];
      productRecommendations?: any[];
      ragInfo?: any;
      conversationId: string;
      metadata: Record<string, any>;
    }>('/conversation/process', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // Get conversation analytics
  getAnalytics: async (conversationId: string): Promise<{
    conversationId: string;
    totalMessages: number;
    avgResponseTime: number;
    languages: string[];
    intentDistribution: Record<string, number>;
    ragUtilization: number;
    conversionEvents: any[];
    customerSatisfaction: number;
    productInteractions: any[];
  }> => {
    return apiRequest<{
      conversationId: string;
      totalMessages: number;
      avgResponseTime: number;
      languages: string[];
      intentDistribution: Record<string, number>;
      ragUtilization: number;
      conversionEvents: any[];
      customerSatisfaction: number;
      productInteractions: any[];
    }>(`/conversation/${conversationId}/analytics`);
  },
};

// Test Scenarios API (Enhanced testing)
export const testApi = {
  // Run test scenario
  runScenario: async (scenario: any, merchantId: string): Promise<{
    scenarioId: string;
    merchantId: string;
    totalSteps: number;
    passedSteps: number;
    successRate: number;
    avgResponseTime: number;
    results: any[];
    timestamp: number;
  }> => {
    return apiRequest<{
      scenarioId: string;
      merchantId: string;
      totalSteps: number;
      passedSteps: number;
      successRate: number;
      avgResponseTime: number;
      results: any[];
      timestamp: number;
    }>('/test/scenarios/run', {
      method: 'POST',
      body: JSON.stringify({ scenario, merchant_id: merchantId }),
    });
  },

  // Get test metrics
  getMetrics: async (): Promise<any> => {
    return apiRequest<any>('/test/metrics');
  },

  // Run load tests
  runLoadTest: async (config: any): Promise<any> => {
    return apiRequest<any>('/test/load', {
      method: 'POST',
      body: JSON.stringify(config),
    });
  },
};

// Utility function to check API health
export const checkApiHealth = async (): Promise<boolean> => {
  try {
    const response = await systemApi.getHealth();
    return response.status === 'healthy';
  } catch (error) {
    console.error('API health check failed:', error);
    return false;
  }
};

// Export all API functions
export default {
  merchants: merchantsApi,
  messages: messagesApi,
  conversations: conversationsApi,
  queue: queueApi,
  system: systemApi,
  rag: ragApi,
  conversationEngine: conversationEngineApi,
  test: testApi,
  checkHealth: checkApiHealth,
};
