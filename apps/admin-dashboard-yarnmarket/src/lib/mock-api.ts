// Mock API service for development and testing
import { Merchant, Message, Conversation, SystemMetrics } from '@/types';

// Persistent mock data using localStorage
const STORAGE_KEY = 'yarnmarket_merchants';

const getStoredMerchants = (): Merchant[] => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.warn('Failed to parse stored merchants');
      }
    }
  }
  return initialMockMerchants;
};

const saveStoredMerchants = (merchants: Merchant[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merchants));
  }
};

const initialMockMerchants: Merchant[] = [
  {
    id: 1,
    business_name: "Tech Solutions Ltd",
    phone_number: "+234701234567",
    email: "contact@techsolutions.ng",
    business_type: "electronics",
    created_at: "2024-01-15T10:30:00Z",
    status: "active",
    total_messages: 45,
    active_conversations: 3,
    last_message_at: "2024-01-20T14:22:00Z"
  },
  {
    id: 2,
    business_name: "Fashion Hub",
    phone_number: "+234812345678",
    email: "info@fashionhub.ng",
    business_type: "fashion",
    created_at: "2024-01-10T08:15:00Z",
    status: "active",
    total_messages: 78,
    active_conversations: 5,
    last_message_at: "2024-01-20T16:45:00Z"
  },
  {
    id: 3,
    business_name: "Food Express",
    phone_number: "+234909876543",
    email: "orders@foodexpress.ng",
    business_type: "food",
    created_at: "2024-01-12T12:00:00Z",
    status: "inactive",
    total_messages: 23,
    active_conversations: 0,
    last_message_at: "2024-01-18T11:30:00Z"
  }
];

const mockMessages: Message[] = [
  {
    id: "msg_001",
    from_phone: "+234701111111",
    merchant_id: "1",
    merchant_business_name: "Tech Solutions Ltd",
    content: "Hello, I want to buy iPhone 14",
    type: "text",
    status: "processed",
    ai_response: "Hello! We have iPhone 14 available for ₦850,000. Would you like to know more about the specifications?",
    processing_time: 0.45,
    created_at: "2024-01-20T14:22:00Z",
    conversation_id: "conv_001"
  },
  {
    id: "msg_002", 
    from_phone: "+234802222222",
    merchant_id: "2",
    merchant_business_name: "Fashion Hub",
    content: "Wetin be your best shoe for man?",
    type: "text",
    status: "processed",
    ai_response: "We get plenty fine shoes for men o! Our Nike Air Force 1 na hot cake - ₦45,000. Adidas Ultraboost sef dey - ₦65,000. Which one you wan check?",
    processing_time: 0.32,
    created_at: "2024-01-20T16:45:00Z",
    conversation_id: "conv_002"
  },
  {
    id: "msg_003",
    from_phone: "+234703333333", 
    merchant_id: "1",
    merchant_business_name: "Tech Solutions Ltd",
    content: "How much Samsung Galaxy S24?",
    type: "text",
    status: "failed",
    error_message: "Timeout error - no response from conversation engine",
    processing_time: 5.0,
    created_at: "2024-01-20T15:10:00Z",
    conversation_id: "conv_003"
  }
];

const mockConversations: Conversation[] = [
  {
    id: "conv_001",
    customer_phone: "+234701111111",
    merchant_id: "1",
    merchant_business_name: "Tech Solutions Ltd",
    status: "active",
    message_count: 5,
    messages: [mockMessages[0]],
    last_activity: "2024-01-20T14:22:00Z",
    created_at: "2024-01-20T14:20:00Z"
  },
  {
    id: "conv_002",
    customer_phone: "+234802222222",
    merchant_id: "2", 
    merchant_business_name: "Fashion Hub",
    status: "completed",
    message_count: 8,
    messages: [mockMessages[1]],
    last_activity: "2024-01-20T16:45:00Z",
    created_at: "2024-01-20T16:30:00Z"
  }
];

const mockMetrics: SystemMetrics = {
  total_merchants: 3,
  active_merchants: 2,
  total_messages_today: 25,
  processed_messages_today: 22,
  failed_messages_today: 3,
  avg_processing_time_ms: 450,
  success_rate: 88.0,
  active_conversations: 8
};

// Mock API functions
export const mockApi = {
  // Merchants
  merchants: {
    getAll: async (): Promise<Merchant[]> => {
      await delay(300);
      return getStoredMerchants();
    },
    
    create: async (data: Partial<Merchant>): Promise<Merchant> => {
      await delay(500);
      const merchants = getStoredMerchants();
      const newMerchant: Merchant = {
        id: Math.max(0, ...merchants.map(m => m.id)) + 1,
        business_name: data.business_name!,
        phone_number: data.phone_number || data.contact_phone!,
        contact_phone: data.contact_phone || data.phone_number!,
        email: data.email || data.contact_email,
        contact_email: data.contact_email || data.email,
        business_type: data.business_type,
        business_address: data.business_address,
        created_at: new Date().toISOString(),
        status: "active",
        onboarding_status: "active",
        total_messages: 0,
        active_conversations: 0
      };
      merchants.push(newMerchant);
      saveStoredMerchants(merchants);
      return newMerchant;
    },
    
    update: async (id: number, data: Partial<Merchant>): Promise<Merchant> => {
      await delay(400);
      const merchants = getStoredMerchants();
      const index = merchants.findIndex(m => m.id === id);
      if (index === -1) throw new Error('Merchant not found');
      
      merchants[index] = { ...merchants[index], ...data };
      saveStoredMerchants(merchants);
      return merchants[index];
    },
    
    delete: async (id: number): Promise<void> => {
      await delay(300);
      const merchants = getStoredMerchants();
      const index = merchants.findIndex(m => m.id === id);
      if (index === -1) throw new Error('Merchant not found');
      merchants.splice(index, 1);
      saveStoredMerchants(merchants);
    }
  },
  
  // Messages
  messages: {
    getAll: async (filters?: any): Promise<Message[]> => {
      await delay(200);
      let filtered = [...mockMessages];
      
      if (filters?.status && filters.status !== 'all') {
        filtered = filtered.filter(m => m.status === filters.status);
      }
      
      if (filters?.type && filters.type !== 'all') {
        filtered = filtered.filter(m => m.type === filters.type);
      }
      
      if (filters?.merchantId) {
        filtered = filtered.filter(m => m.merchant_id === filters.merchantId);
      }
      
      return filtered;
    },
    
    retry: async (messageId: string): Promise<{ status: string; message_id: string }> => {
      await delay(1000);
      const message = mockMessages.find(m => m.id === messageId);
      if (message) {
        message.status = 'processed';
        message.error_message = undefined;
        message.processing_time = 0.8;
      }
      return { status: 'success', message_id: messageId };
    }
  },
  
  // Conversations
  conversations: {
    getAll: async (filters?: any): Promise<Conversation[]> => {
      await delay(250);
      let filtered = [...mockConversations];
      
      if (filters?.status && filters.status !== 'all') {
        filtered = filtered.filter(c => c.status === filters.status);
      }
      
      if (filters?.merchantId) {
        filtered = filtered.filter(c => c.merchant_id === filters.merchantId);
      }
      
      return filtered;
    }
  },
  
  // System
  system: {
    getMetrics: async (): Promise<SystemMetrics> => {
      await delay(300);
      return mockMetrics;
    },
    
    getHealth: async (): Promise<{ status: string; timestamp: string; services: Record<string, string> }> => {
      await delay(150);
      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        services: {
          postgresql: 'healthy',
          redis: 'healthy',
          mongodb: 'healthy',
          rabbitmq: 'healthy',
          'conversation-engine': 'healthy'
        }
      };
    }
  },
  
  // Test Console
  testConsole: {
    sendMessage: async (data: { merchant_id: string; message: string; from_phone: string }): Promise<any> => {
      await delay(800);
      return {
        message_id: `test_${Date.now()}`,
        ai_response: `Thank you for your message: "${data.message}". This is a test response from merchant ${data.merchant_id}.`,
        processing_time: 0.75,
        status: 'processed'
      };
    }
  },
  
  // Queues
  queues: {
    getStatus: async (): Promise<any[]> => {
      await delay(300);
      return [
        {
          name: 'message_processing',
          message_count: 12,
          consumer_count: 3,
          ready_messages: 8,
          unacked_messages: 4,
          status: 'healthy'
        },
        {
          name: 'webhook_retry',
          message_count: 5,
          consumer_count: 1,
          ready_messages: 3,
          unacked_messages: 2,
          status: 'healthy'
        },
        {
          name: 'failed_messages',
          message_count: 2,
          consumer_count: 1,
          ready_messages: 2,
          unacked_messages: 0,
          status: 'warning'
        }
      ];
    }
  },
  
  // Settings
  settings: {
    get: async (): Promise<any> => {
      await delay(200);
      return {
        general: {
          dashboard_title: 'YarnMarket AI Dashboard',
          timezone: 'Africa/Lagos',
          language: 'en',
          theme: 'dark'
        },
        notifications: {
          email_alerts: true,
          webhook_failures: true,
          new_merchants: true,
          daily_reports: false
        }
      };
    },
    
    update: async (settings: any): Promise<void> => {
      await delay(500);
      console.log('Settings updated:', settings);
    },
    
    testConnection: async (data: { type: string; settings: any }): Promise<{ success: boolean; error?: string }> => {
      await delay(1500);
      
      // Simulate random success/failure for demo
      const success = Math.random() > 0.3;
      
      if (success) {
        return { success: true };
      } else {
        return {
          success: false,
          error: `Connection test failed for ${data.type}. Please check your settings.`
        };
      }
    }
  }
};

// Utility function to simulate network delay
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Environment flag to use mock API
// Only use mock API if explicitly set to 'true', regardless of NODE_ENV
export const USE_MOCK_API = process.env.NEXT_PUBLIC_USE_MOCK_API === 'true';
