"""
Pydantic models for the conversation engine
"""

from typing import Optional, List, Dict, Any, Literal
from datetime import datetime
from enum import Enum

from pydantic import BaseModel, Field


class MessageType(str, Enum):
    TEXT = "text"
    AUDIO = "audio"
    IMAGE = "image"
    DOCUMENT = "document"
    INTERACTIVE = "interactive"


class ConversationType(str, Enum):
    GREETING = "greeting"
    PRODUCT_INQUIRY = "product_inquiry"
    PRICE_NEGOTIATION = "price_negotiation"
    ORDER_CREATION = "order_creation"
    COMPLAINT = "complaint"
    GENERAL_CHAT = "general_chat"


class Language(str, Enum):
    PIDGIN = "pidgin"
    YORUBA = "yoruba"
    IGBO = "igbo"
    HAUSA = "hausa"
    ENGLISH = "english"
    MIXED = "mixed"  # Code-switching


class NegotiationAction(str, Enum):
    ACCEPT = "accept"
    COUNTER = "counter"
    BUNDLE = "bundle"
    REJECT = "reject"
    STALL = "stall"


class WhatsAppMessage(BaseModel):
    """WhatsApp message structure"""
    id: str
    from_number: str = Field(..., alias="from")
    timestamp: datetime
    type: MessageType
    text: Optional[str] = None
    audio_url: Optional[str] = None
    image_url: Optional[str] = None
    document_url: Optional[str] = None
    
    class Config:
        populate_by_name = True


class CustomerProfile(BaseModel):
    """Customer profile information"""
    phone_number: str
    name: Optional[str] = None
    preferred_language: Optional[Language] = None
    location: Optional[str] = None
    purchase_history: List[Dict[str, Any]] = []
    conversation_style: Optional[Dict[str, float]] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)


class Product(BaseModel):
    """Product information"""
    id: str
    name: str
    description: str
    price: float
    currency: str = "NGN"
    category: str
    in_stock: bool = True
    stock_quantity: Optional[int] = None
    images: List[str] = []
    merchant_id: str


class MerchantSettings(BaseModel):
    """Merchant configuration settings"""
    merchant_id: str
    business_name: str
    business_type: str
    phone_number: str
    
    # Pricing rules
    min_discount_percentage: float = 0.0
    max_discount_percentage: float = 20.0
    negotiation_enabled: bool = True
    bulk_discount_threshold: int = 10
    bulk_discount_percentage: float = 5.0
    
    # Conversation settings
    greeting_message: Optional[str] = None
    farewell_message: Optional[str] = None
    business_hours: Dict[str, Any] = {}
    auto_responses: Dict[str, str] = {}
    
    # AI behavior
    personality_traits: Dict[str, float] = {
        "friendliness": 0.8,
        "formality": 0.3,
        "persistence": 0.7,
        "humor": 0.6
    }
    
    # Languages
    supported_languages: List[Language] = [Language.PIDGIN, Language.ENGLISH]
    primary_language: Language = Language.PIDGIN


class ConversationRequest(BaseModel):
    """Request to process a conversation message"""
    message: WhatsAppMessage
    merchant_id: str
    customer_phone: str
    conversation_history: Optional[List[Dict[str, Any]]] = []
    audio_url: Optional[str] = None


class QuickReply(BaseModel):
    """Quick reply button"""
    id: str
    title: str
    payload: str


class ConversationResponse(BaseModel):
    """AI response to a conversation"""
    text: str
    language: Language
    message_type: MessageType = MessageType.TEXT
    
    # Interactive elements
    quick_replies: List[QuickReply] = []
    buttons: List[Dict[str, Any]] = []
    
    # Media
    image_url: Optional[str] = None
    audio_url: Optional[str] = None
    
    # Metadata
    confidence: float = Field(ge=0.0, le=1.0)
    intent_type: ConversationType
    requires_human: bool = False
    
    # Business context
    mentioned_products: List[str] = []
    price_mentioned: Optional[float] = None
    negotiation_stage: Optional[str] = None
    
    # Tracking
    response_id: str = Field(default_factory=lambda: f"resp_{datetime.utcnow().timestamp()}")
    generated_at: datetime = Field(default_factory=datetime.utcnow)


class NegotiationState(BaseModel):
    """Current state of a price negotiation"""
    product_id: str
    original_price: float
    customer_offer: Optional[float] = None
    current_counter: Optional[float] = None
    round_number: int = 1
    customer_sentiment: float = 0.0  # -1 to 1
    urgency_level: float = 0.0  # 0 to 1
    bundle_suggested: bool = False
    stalling_count: int = 0
    
    # History
    offer_history: List[Dict[str, Any]] = []
    started_at: datetime = Field(default_factory=datetime.utcnow)
    
    def add_offer(self, offer: float, sender: str, response: Optional[str] = None):
        """Add an offer to the negotiation history"""
        self.offer_history.append({
            "offer": offer,
            "sender": sender,
            "response": response,
            "timestamp": datetime.utcnow()
        })


class Intent(BaseModel):
    """Extracted intent from customer message"""
    type: ConversationType
    confidence: float = Field(ge=0.0, le=1.0)
    language: Language
    entities: Dict[str, Any] = {}
    
    # Extracted information
    product_names: List[str] = []
    price_mentioned: Optional[float] = None
    quantity_mentioned: Optional[int] = None
    sentiment: float = 0.0  # -1 to 1
    urgency: float = 0.0  # 0 to 1


class LanguageContext(BaseModel):
    """Language detection and context"""
    primary_language: Language
    secondary_language: Optional[Language] = None
    code_switching: bool = False
    confidence: float = Field(ge=0.0, le=1.0)
    
    # Cultural markers
    greeting_type: Optional[str] = None
    formality_level: float = 0.5  # 0 = very informal, 1 = very formal
    regional_markers: List[str] = []


class ConversationMetrics(BaseModel):
    """Metrics for conversation performance"""
    total_conversations: int
    active_conversations: int
    conversion_rate: float
    average_response_time: float
    customer_satisfaction: float
    
    # Language distribution
    language_distribution: Dict[Language, int]
    
    # Intent distribution
    intent_distribution: Dict[ConversationType, int]
    
    # Time-based metrics
    peak_hours: Dict[str, int]
    conversation_duration_avg: float
    
    # Business metrics
    total_revenue: float
    average_order_value: float
    negotiation_success_rate: float