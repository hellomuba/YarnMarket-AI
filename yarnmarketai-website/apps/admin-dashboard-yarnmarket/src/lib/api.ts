// YarnMarket AI Dashboard API Client

import axios from 'axios';
import { Merchant, Message, Conversation, QueueInfo, SystemMetrics, TestMessageRequest } from '@/types';
import { mockApi, USE_MOCK_API } from './mock-api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8005';

export const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    throw error;
  }
);

// Merchant API calls
export const merchantsApi = {
  getAll: async (): Promise<Merchant[]> => {
    if (USE_MOCK_API) {
      return mockApi.merchants.getAll();
    }
    const response = await api.get('/merchants');
    return response.data;
  },

  create: async (merchantData: Partial<Merchant>): Promise<Merchant> => {
    if (USE_MOCK_API) {
      return mockApi.merchants.create(merchantData);
    }
    const response = await api.post('/merchants', merchantData);
    return response.data;
  },

  update: async (id: number, merchantData: Partial<Merchant>): Promise<Merchant> => {
    if (USE_MOCK_API) {
      return mockApi.merchants.update(id, merchantData);
    }
    const response = await api.put(`/merchants/${id}`, merchantData);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    if (USE_MOCK_API) {
      return mockApi.merchants.delete(id);
    }
    await api.delete(`/merchants/${id}`);
  },
};

// Messages API calls
export const messagesApi = {
  getAll: async (filters?: any): Promise<Message[]> => {
    if (USE_MOCK_API) {
      return mockApi.messages.getAll(filters);
    }
    const params = new URLSearchParams();
    if (filters?.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters?.type && filters.type !== 'all') params.append('type', filters.type);
    if (filters?.dateRange && filters.dateRange !== 'all') params.append('dateRange', filters.dateRange);
    if (filters?.merchantId) params.append('merchant_id', filters.merchantId.toString());
    
    const response = await api.get(`/api/messages?${params.toString()}`);
    return response.data;
  },

  retry: async (messageId: string): Promise<{ status: string; message_id: string }> => {
    if (USE_MOCK_API) {
      return mockApi.messages.retry(messageId);
    }
    const response = await api.post(`/api/messages/${messageId}/retry`);
    return response.data;
  },
};

// Conversations API calls
export const conversationsApi = {
  getAll: async (filters?: any): Promise<Conversation[]> => {
    if (USE_MOCK_API) {
      return mockApi.conversations.getAll(filters);
    }
    const params = new URLSearchParams();
    if (filters?.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters?.dateRange && filters.dateRange !== 'all') params.append('dateRange', filters.dateRange);
    if (filters?.merchantId) params.append('merchant_id', filters.merchantId.toString());
    
    const response = await api.get(`/api/conversations?${params.toString()}`);
    return response.data;
  },
};

// Queue API calls
export const queuesApi = {
  getStatus: async (): Promise<QueueInfo[]> => {
    if (USE_MOCK_API) {
      return mockApi.queues.getStatus();
    }
    const response = await api.get('/api/queues');
    return response.data;
  },
};

// System API calls
export const systemApi = {
  getMetrics: async (merchantId?: number): Promise<SystemMetrics> => {
    if (USE_MOCK_API) {
      return mockApi.system.getMetrics();
    }
    const params = merchantId ? `?merchant_id=${merchantId}` : '';
    const response = await api.get(`/api/metrics${params}`);
    return response.data;
  },

  getHealth: async (): Promise<{ status: string; timestamp: string; services: Record<string, string> }> => {
    if (USE_MOCK_API) {
      return mockApi.system.getHealth();
    }
    const response = await api.get('/health');
    return response.data;
  },

  sendTestMessage: async (testData: TestMessageRequest): Promise<{ status: string; message_id: string }> => {
    const response = await api.post('/api/test-message', testData);
    return response.data;
  },
};

// Test Console API calls
export const testConsoleApi = {
  sendMessage: async (data: { merchant_id: string; message: string; from_phone: string }): Promise<any> => {
    if (USE_MOCK_API) {
      return mockApi.testConsole.sendMessage(data);
    }
    const response = await api.post('/api/test-console/send-message', data);
    return response.data;
  },
};

// Settings API calls
export const settingsApi = {
  get: async (): Promise<any> => {
    if (USE_MOCK_API) {
      return mockApi.settings.get();
    }
    const response = await api.get('/api/settings');
    return response.data;
  },

  update: async (settings: any): Promise<void> => {
    if (USE_MOCK_API) {
      return mockApi.settings.update(settings);
    }
    const response = await api.put('/api/settings', settings);
    return response.data;
  },

  testConnection: async (data: { type: string; settings: any }): Promise<{ success: boolean; error?: string }> => {
    if (USE_MOCK_API) {
      return mockApi.settings.testConnection(data);
    }
    const response = await api.post('/api/settings/test-connection', data);
    return response.data;
  },
};

// RAG System API calls (Weaviate-based)
export const ragSystemApi = {
  getHealth: async (): Promise<any> => {
    const RAG_URL = process.env.NEXT_PUBLIC_RAG_API_URL || 'http://localhost:8004';
    const response = await axios.get(`${RAG_URL}/health`);
    return response.data;
  },

  indexCatalog: async (data: { merchant_id: string; products: any[]; force_recreate?: boolean }): Promise<any> => {
    const RAG_URL = process.env.NEXT_PUBLIC_RAG_API_URL || 'http://localhost:8004';
    const response = await axios.post(`${RAG_URL}/index`, data);
    return response.data;
  },

  searchProducts: async (data: {
    merchant_id: string;
    text_query?: string;
    image_base64?: string;
    filters?: any;
    limit?: number;
    score_threshold?: number;
  }): Promise<any> => {
    const RAG_URL = process.env.NEXT_PUBLIC_RAG_API_URL || 'http://localhost:8004';
    const response = await axios.post(`${RAG_URL}/search`, data);
    return response.data;
  },

  getMerchantCollections: async (): Promise<any> => {
    const RAG_URL = process.env.NEXT_PUBLIC_RAG_API_URL || 'http://localhost:8004';
    const response = await axios.get(`${RAG_URL}/collections`);
    return response.data;
  }
};

// Direct Weaviate API calls (for advanced functionality)
export const weaviateApi = {
  getHealth: async (): Promise<any> => {
    const WEAVIATE_URL = process.env.NEXT_PUBLIC_WEAVIATE_URL || 'http://localhost:8080';
    const response = await axios.get(`${WEAVIATE_URL}/v1/.well-known/ready`);
    return response.data;
  },

  getSchema: async (): Promise<any> => {
    const WEAVIATE_URL = process.env.NEXT_PUBLIC_WEAVIATE_URL || 'http://localhost:8080';
    const response = await axios.get(`${WEAVIATE_URL}/v1/schema`);
    return response.data;
  },

  getObjectsCount: async (className: string): Promise<any> => {
    const WEAVIATE_URL = process.env.NEXT_PUBLIC_WEAVIATE_URL || 'http://localhost:8080';
    const response = await axios.get(`${WEAVIATE_URL}/v1/objects?class=${className}&limit=1`);
    return response.data;
  }
};

export default api;
