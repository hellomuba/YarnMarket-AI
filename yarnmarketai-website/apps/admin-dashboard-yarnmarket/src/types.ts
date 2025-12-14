// YarnMarket AI Dashboard Types

export interface Merchant {
  id: number;
  business_name: string;
  phone_number?: string;
  contact_phone?: string;
  email?: string;
  contact_email?: string;
  business_type?: string;
  business_address?: string;
  created_at?: string;
  updated_at?: string;
  status?: 'active' | 'inactive' | 'new' | 'pending';
  onboarding_status?: 'active' | 'inactive' | 'pending';
  total_messages?: number;
  active_conversations?: number;
  last_message_at?: string;
}

export interface Message {
  id: string;
  from_phone: string;
  merchant_id: string;
  merchant_business_name?: string;
  content: string;
  type: 'text' | 'image' | 'document';
  status: 'pending' | 'processing' | 'processed' | 'failed' | 'sent' | 'error';
  ai_response?: string;
  processing_time?: number;
  created_at: string;
  error_message?: string;
  is_fallback?: boolean;
  conversation_id?: string;
}

export interface Conversation {
  id: string;
  customer_phone: string;
  merchant_id: string;
  merchant_business_name?: string;
  status: 'active' | 'completed' | 'pending' | 'archived';
  language?: string;
  message_count?: number;
  messages?: Message[];
  last_activity?: string;
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

export interface WebSocketMessage {
  type: 'connected' | 'merchant_created' | 'message_status_update' | 'new_message' | 'system_update' | 'queue_update' | 'error';
  data?: any;
  message?: string;
  timestamp: string;
}

export type ConnectionStatus = 'Connecting' | 'Open' | 'Closed' | 'Error';

export interface TestMessageRequest {
  merchant_id: number;
  from_phone: string;
  message: string;
}
