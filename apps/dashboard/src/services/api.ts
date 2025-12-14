// YarnMarket AI Dashboard API Client

import axios from 'axios';
import { Merchant, Message, Conversation, QueueInfo, SystemMetrics, TestMessage } from '../types';

const API_BASE_URL = (typeof process !== 'undefined' && process.env?.REACT_APP_API_URL) || 'http://localhost:8005';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
apiClient.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Response Error:', error);
    
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      const message = data?.detail || data?.message || `HTTP ${status} Error`;
      throw new Error(message);
    } else if (error.request) {
      // Request was made but no response received
      throw new Error('No response from server. Please check if the dashboard API is running.');
    } else {
      // Something else happened
      throw new Error(error.message || 'Unknown API error');
    }
  }
);

// API Methods
export const merchantsApi = {
  // Get all merchants
  getAll: async (): Promise<Merchant[]> => {
    const response = await apiClient.get('/api/merchants');
    return response.data;
  },

  // Create new merchant
  create: async (merchantData: Omit<Merchant, 'id' | 'created_at' | 'updated_at' | 'status' | 'total_messages' | 'active_conversations'>): Promise<Merchant> => {
    const response = await apiClient.post('/api/merchants', merchantData);
    return response.data;
  },

  // Update merchant
  update: async (merchantId: number, merchantData: Partial<Merchant>): Promise<Merchant> => {
    const response = await apiClient.put(`/api/merchants/${merchantId}`, merchantData);
    return response.data;
  },

  // Delete merchant (if needed)
  delete: async (merchantId: number): Promise<void> => {
    await apiClient.delete(`/api/merchants/${merchantId}`);
  },
};

export const messagesApi = {
  // Get messages with optional filtering
  getAll: async (params?: {
    merchant_id?: number;
    status?: string;
    limit?: number;
  }): Promise<Message[]> => {
    const response = await apiClient.get('/api/messages', { params });
    return response.data;
  },

  // Retry failed message
  retry: async (messageId: string): Promise<{ status: string; message_id: string; retry_job_id: string }> => {
    const response = await apiClient.post(`/api/messages/${messageId}/retry`);
    return response.data;
  },
};

export const conversationsApi = {
  // Get conversations with optional merchant filtering
  getAll: async (merchantId?: number): Promise<Conversation[]> => {
    const params = merchantId ? { merchant_id: merchantId } : undefined;
    const response = await apiClient.get('/api/conversations', { params });
    return response.data;
  },
};

export const queuesApi = {
  // Get queue status
  getStatus: async (): Promise<QueueInfo[]> => {
    const response = await apiClient.get('/api/queues');
    return response.data;
  },
};

export const metricsApi = {
  // Get system metrics
  getSystemMetrics: async (merchantId?: number): Promise<SystemMetrics> => {
    const params = merchantId ? { merchant_id: merchantId } : undefined;
    const response = await apiClient.get('/api/metrics', { params });
    return response.data;
  },
};

export const testingApi = {
  // Send test message through existing flow
  sendTestMessage: async (testData: TestMessage): Promise<{ 
    status: string; 
    merchant_id: number; 
    test_message_id: string 
  }> => {
    const response = await apiClient.post('/api/test-message', testData);
    return response.data;
  },
};

export const systemApi = {
  // Health check
  getHealth: async (): Promise<{
    status: string;
    timestamp: string;
    services: Record<string, string>;
  }> => {
    const response = await apiClient.get('/health');
    return response.data;
  },

  // Prometheus metrics
  getMetrics: async (): Promise<string> => {
    const response = await apiClient.get('/metrics', {
      headers: { 'Accept': 'text/plain' }
    });
    return response.data;
  },
};

export default apiClient;
