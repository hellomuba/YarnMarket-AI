// YarnMarket AI Dashboard API Client

import axios from 'axios';
import { Merchant, Message, Conversation, QueueInfo, SystemMetrics, TestMessageRequest } from '@/types';

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
    const response = await api.get('/api/merchants');
    return response.data;
  },

  create: async (merchantData: Partial<Merchant>): Promise<Merchant> => {
    const response = await api.post('/api/merchants', merchantData);
    return response.data;
  },

  update: async (id: number, merchantData: Partial<Merchant>): Promise<Merchant> => {
    const response = await api.put(`/api/merchants/${id}`, merchantData);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/api/merchants/${id}`);
  },
};

// Messages API calls
export const messagesApi = {
  getAll: async (merchantId?: number, status?: string, limit?: number): Promise<Message[]> => {
    const params = new URLSearchParams();
    if (merchantId) params.append('merchant_id', merchantId.toString());
    if (status) params.append('status', status);
    if (limit) params.append('limit', limit.toString());

    const response = await api.get(`/api/messages?${params.toString()}`);
    return response.data;
  },

  retry: async (messageId: string): Promise<{ status: string; message_id: string }> => {
    const response = await api.post(`/api/messages/${messageId}/retry`);
    return response.data;
  },
};

// Conversations API calls
export const conversationsApi = {
  getAll: async (merchantId?: number): Promise<Conversation[]> => {
    const params = merchantId ? `?merchant_id=${merchantId}` : '';
    const response = await api.get(`/api/conversations${params}`);
    return response.data;
  },
};

// Queue API calls
export const queuesApi = {
  getStatus: async (): Promise<QueueInfo[]> => {
    const response = await api.get('/api/queues');
    return response.data;
  },
};

// System API calls
export const systemApi = {
  getMetrics: async (merchantId?: number): Promise<SystemMetrics> => {
    const params = merchantId ? `?merchant_id=${merchantId}` : '';
    const response = await api.get(`/api/metrics${params}`);
    return response.data;
  },

  getHealth: async (): Promise<{ status: string; timestamp: string; services: Record<string, string> }> => {
    const response = await api.get('/health');
    return response.data;
  },

  sendTestMessage: async (testData: TestMessageRequest): Promise<{ status: string; message_id: string }> => {
    const response = await api.post('/api/test-message', testData);
    return response.data;
  },
};

export default api;
