// TypeScript definitions for YarnMarket AI Dashboard
// This file contains all the interface definitions used across the application

// ==========================================
// CORE BUSINESS TYPES
// ==========================================

export interface Merchant {
  id: string;
  business_name: string;
  business_type: string;
  whatsapp_number: string;
  contact_email: string;
  location?: string;
  description?: string;
  logo_url?: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  settings: MerchantSettings;
  metrics?: MerchantMetrics;
  // Additional fields for UI compatibility
  name: string; // Alias for business_name
  phone_number: string; // Alias for whatsapp_number
  status: 'active' | 'inactive' | 'pending';
  message_count?: number;
}

export interface MerchantSettings {
  greeting_message?: string;
  business_hours?: BusinessHours;
  auto_reply_enabled: boolean;
  language_preferences: string[];
  pricing_rules?: PricingRules;
  negotiation_enabled: boolean;
  cultural_adaptation: boolean;
}

export interface BusinessHours {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

export interface DaySchedule {
  open: string;
  close: string;
  is_open: boolean;
}

export interface PricingRules {
  negotiation_range: number;
  bulk_discounts: BulkDiscount[];
  loyalty_discounts: LoyaltyDiscount[];
}

export interface BulkDiscount {
  min_quantity: number;
  discount_percentage: number;
}

export interface LoyaltyDiscount {
  customer_type: string;
  discount_percentage: number;
}

export interface MerchantMetrics {
  total_conversations: number;
  active_conversations: number;
  messages_sent: number;
  messages_received: number;
  avg_response_time: number;
  customer_satisfaction: number;
  conversion_rate: number;
  revenue_generated?: number;
}

// ==========================================
// MESSAGE & CONVERSATION TYPES
// ==========================================

export interface Message {
  id: string;
  conversation_id: string;
  merchant_id: string;
  from_user: string;
  to_user?: string;
  text?: string;
  type: MessageType;
  status: MessageStatus;
  direction: 'inbound' | 'outbound';
  whatsapp_message_id?: string;
  image_url?: string;
  document_url?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
  delivered_at?: string;
  read_at?: string;
  error_message?: string;
  retry_count: number;
}

export type MessageType = 'text' | 'image' | 'document' | 'voice' | 'video' | 'location' | 'contact' | 'template' | 'interactive';

export type MessageStatus = 'pending' | 'sent' | 'delivered' | 'read' | 'failed' | 'queued' | 'processing';

export interface Conversation {
  id: string;
  merchant_id: string;
  customer_phone: string;
  customer_name?: string;
  status: ConversationStatus;
  language: string;
  last_message_at: string;
  created_at: string;
  updated_at: string;
  message_count: number;
  unread_count: number;
  tags: string[];
  metadata?: ConversationMetadata;
  context?: ConversationContext;
}

export type ConversationStatus = 'active' | 'waiting' | 'closed' | 'archived' | 'spam';

export interface ConversationMetadata {
  customer_info?: CustomerInfo;
  product_interests?: ProductInterest[];
  negotiation_history?: NegotiationHistory[];
  satisfaction_rating?: number;
  notes?: string[];
}

export interface ConversationContext {
  intent: string;
  confidence: number;
  entities: Record<string, any>;
  cultural_context: CulturalContext;
  previous_interactions?: PreviousInteraction[];
}

export interface CustomerInfo {
  name?: string;
  phone: string;
  email?: string;
  location?: string;
  preferences?: CustomerPreferences;
  loyalty_tier?: string;
}

export interface CustomerPreferences {
  language: string;
  preferred_contact_time?: string;
  product_categories: string[];
  price_sensitivity?: 'low' | 'medium' | 'high';
}

export interface ProductInterest {
  product_name: string;
  category: string;
  price_range?: PriceRange;
  mentioned_at: string;
  interest_level: number;
}

export interface PriceRange {
  min: number;
  max: number;
  currency: string;
}

export interface NegotiationHistory {
  product: string;
  initial_price: number;
  final_price: number;
  discount_given: number;
  negotiation_rounds: number;
  outcome: 'success' | 'failed' | 'ongoing';
  timestamp: string;
}

export interface CulturalContext {
  detected_language: string;
  formality_level: 'formal' | 'informal' | 'mixed';
  cultural_markers: string[];
  greeting_style: string;
  communication_patterns: string[];
}

export interface PreviousInteraction {
  date: string;
  outcome: string;
  satisfaction: number;
  products_discussed: string[];
}

// ==========================================
// SYSTEM & QUEUE TYPES
// ==========================================

export interface QueueStatus {
  total_jobs: number;
  active_jobs: number;
  waiting_jobs: number;
  failed_jobs: number;
  completed_jobs: number;
  queues: QueueInfo[];
  updated_at: string;
}

export interface QueueInfo {
  name: string;
  size: number;
  processing: number;
  failed: number;
  completed: number;
  rate: number; // jobs per second
  avg_processing_time: number;
}

export interface SystemMetrics {
  uptime: number;
  cpu_usage: number;
  memory_usage: number;
  disk_usage: number;
  active_connections: number;
  total_merchants: number;
  total_conversations: number;
  messages_per_minute: number;
  error_rate: number;
  response_time: ResponseTimeMetrics;
  database: DatabaseMetrics;
  redis: RedisMetrics;
  queue_sizes?: {
    whatsapp_messages: number;
    ai_responses: number;
    failed_messages: number;
  };
  recent_activity?: Array<{
    message: string;
    timestamp: string;
    type: string;
  }>;
}

export interface ResponseTimeMetrics {
  avg: number;
  p50: number;
  p95: number;
  p99: number;
}

export interface DatabaseMetrics {
  connections: number;
  slow_queries: number;
  query_time_avg: number;
  size_mb: number;
}

export interface RedisMetrics {
  connected_clients: number;
  used_memory: number;
  hit_rate: number;
  operations_per_sec: number;
}

// ==========================================
// UI & COMPONENT TYPES
// ==========================================

export interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  selectedMerchant: Merchant | null;
  onMerchantSelect: (merchant: Merchant | null) => void;
}

export interface HeaderProps {
  selectedMerchant: Merchant | null;
  connectionStatus: WebSocketConnectionStatus;
  onMerchantSelect: (merchant: Merchant | null) => void;
}

export type WebSocketConnectionStatus = 'Connecting' | 'Open' | 'Closing' | 'Closed';
export type ConnectionStatus = WebSocketConnectionStatus;

export interface DashboardProps {
  selectedMerchant: Merchant | null;
}

export interface MerchantsProps {
  onMerchantSelect: (merchant: Merchant) => void;
}

export interface MessagesProps {
  selectedMerchant: Merchant | null;
}

export interface ConversationsProps {
  selectedMerchant: Merchant | null;
}

// ==========================================
// API RESPONSE TYPES
// ==========================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: string;
  source?: string;
}

// ==========================================
// ENHANCED RAG & CONVERSATION ENGINE TYPES
// ==========================================

export interface ProductMatch {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  in_stock: boolean;
  similarity_score: number;
  image_urls: string[];
  match_reason: string;
}

export interface RAGSearchResults {
  products: ProductMatch[];
  total_found: number;
  max_similarity: number;
  processing_time: number;
}

export interface ImageAnalysis {
  detected_objects: string[];
  dominant_colors: string[];
  confidence: number;
  description: string;
  matches: ProductMatch[];
  features: ImageFeatures;
  processing_time: number;
}

export interface ImageFeatures {
  detected_objects: string[];
  dominant_colors: string[];
  text_content?: string;
  scene_description: string;
}

export interface ProductRecommendation {
  product: ProductMatch;
  score: number;
  similarity: number;
  visual_similarity?: number;
  reason: string;
}

export interface RAGDebugInfo {
  processedQuery: string;
  vectorResults: VectorResult[];
  imageAnalysis?: ImageAnalysis;
  recommendations?: ProductRecommendation[];
  processingTime: number;
  confidence: number;
}

export interface VectorResult {
  productName: string;
  similarity: number;
  category: string;
  inStock: boolean;
}

export interface ConversationEngineResponse {
  messageId: string;
  text: string;
  timestamp: number;
  quickReplies?: string[];
  productRecommendations?: ProductMatch[];
  ragInfo?: RAGDebugInfo;
  conversationId: string;
  metadata: Record<string, any>;
}

// ==========================================
// TEST SCENARIO TYPES
// ==========================================

export interface TestScenario {
  id: string;
  name: string;
  description: string;
  steps: TestStep[];
  expectedOutcomes: string[];
  tags?: string[];
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface TestStep {
  name: string;
  input: string;
  type: 'text' | 'image';
  image?: File;
  expectedResponse?: string;
  validationFn?: (expected: string, actual: string) => boolean;
  timeout?: number;
}

export interface TestResult {
  scenarioId: string;
  merchantId: string;
  totalSteps: number;
  passedSteps: number;
  successRate: number;
  avgResponseTime: number;
  results: TestStepResult[];
  timestamp: number;
}

export interface TestStepResult {
  step: string;
  input: string;
  expected: string;
  actual: string;
  passed: boolean;
  response_time: number;
  rag_utilized: boolean;
  products_suggested: number;
  error?: string;
}

// ==========================================
// PERFORMANCE MONITORING TYPES
// ==========================================

export interface PerformanceMetrics {
  responseTimeHistory: TimeSeriesData[];
  languageDistribution: LanguageUsage[];
  intentAccuracy: number;
  satisfactionScore: number;
  completionRate: number;
  errorRate: number;
  throughput: number;
}

export interface TimeSeriesData {
  time: string;
  avg: number;
  p95: number;
  count: number;
}

export interface LanguageUsage {
  language: string;
  count: number;
  percentage: number;
}

export interface RAGStats {
  successRate: number;
  avgVectorTime: number;
  cacheHitRate: number;
  indexedProducts: number;
  queryVolume: number;
}

// ==========================================
// FORM & INPUT TYPES
// ==========================================

export interface CreateMerchantForm {
  business_name: string;
  business_type: string;
  whatsapp_number: string;
  contact_email: string;
  location?: string;
  description?: string;
  logo_url?: string;
  settings: Partial<MerchantSettings>;
}

export interface CreateMerchantRequest {
  name: string;
  phone_number: string;
  business_name?: string;
  business_type: string;
  whatsapp_number?: string;
  contact_email?: string;
  location?: string;
  description?: string;
  status: 'active' | 'inactive' | 'pending';
}

export interface TestMessage {
  to: string;
  text: string;
  type: MessageType;
  merchant_id: string;
  test_mode: boolean;
}

export interface SendMessageForm {
  to: string;
  text: string;
  type: MessageType;
  merchant_id: string;
}

export interface FilterOptions {
  merchant_id?: string;
  status?: string;
  language?: string;
  date_range?: DateRange;
  search?: string;
}

export interface DateRange {
  start: string;
  end: string;
}

// ==========================================
// UTILITY TYPES
// ==========================================

export type SortOrder = 'asc' | 'desc';

export interface SortOptions {
  field: string;
  order: SortOrder;
}

export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface TableColumn<T = any> {
  key: keyof T | string;
  title: string;
  sortable?: boolean;
  render?: (value: any, record: T) => React.ReactNode;
  width?: string | number;
}

// ==========================================
// ERROR HANDLING TYPES
// ==========================================

export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

// ==========================================
// NAVIGATION TYPES
// ==========================================

export interface NavigationItem {
  key: string;
  label: string;
  icon: string;
  path: string;
  badge?: number;
  children?: NavigationItem[];
}

// ==========================================
// THEME & UI TYPES
// ==========================================

export interface Theme {
  colors: {
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    error: string;
    background: string;
    surface: string;
    text: string;
  };
  spacing: Record<string, string>;
  typography: Record<string, any>;
}

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

// ==========================================
// EXPORT ALL TYPES
// ==========================================

// Re-export commonly used types for easier imports
export type {
  // Core types
  Merchant as MerchantType,
  Conversation as ConversationType,
  
  // System types
  QueueStatus as QueueStatusType,
  SystemMetrics as SystemMetricsType,
  
  // Enhanced types
  ProductMatch as ProductMatchType,
  RAGSearchResults as RAGSearchResultsType,
  TestScenario as TestScenarioType,
  PerformanceMetrics as PerformanceMetricsType,
};
