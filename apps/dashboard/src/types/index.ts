// YarnMarket AI Dashboard Types

export interface Merchant {
  id: number;
  business_name: string;
  phone_number: string;
  email?: string;
  business_type?: string;
  created_at?: string;
  updated_at?: string;
  status: 'active' | 'inactive' | 'new';
  total_messages: number;
  active_conversations: number;
  last_message_at?: string;
}

export interface Message {
  id: string;
  from_user: string;
  merchant_id: number;
  content: string;
  message_type: string;
  status: 'pending' | 'processing' | 'processed' | 'failed' | 'sent';
  ai_response?: string;
  processing_time_ms?: number;
  timestamp: string;
  is_fallback: boolean;
  conversation_id?: string;
}

export interface Conversation {
  id: number;
  customer_phone: string;
  merchant_id: number;
  status: string;
  language?: string;
  message_count: number;
  last_activity: string;
  created_at: string;
}

export interface QueueInfo {
  name: string;
  message_count: number;
  consumer_count: number;
  ready_messages: number;
  unacked_messages: number;
}

export interface SystemMetrics {
  total_merchants: number;
  active_merchants: number;
  total_messages_today: number;
  processed_messages_today: number;
  failed_messages_today: number;
  avg_processing_time_ms: number;
  success_rate: number;
  active_conversations: number;
}

export interface TestMessage {
  merchant_id: number;
  from_phone: string;
  message: string;
}

export interface WebSocketMessage {
  type: string;
  data?: any;
  message?: string;
  timestamp: string;
}

export type ConnectionStatus = 'Connecting' | 'Open' | 'Closed';
