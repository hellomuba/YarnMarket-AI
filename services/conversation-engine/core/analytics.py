"""
Analytics and metrics collection for YarnMarket AI
"""

import logging
from typing import Dict, Any
from datetime import datetime, timedelta
from .models import ConversationType, Language, MessageType
from .config import Settings
from .database import Database

logger = logging.getLogger(__name__)


class ConversationAnalytics:
    """Analytics system for conversation performance tracking"""
    
    def __init__(self, settings: Settings, database: Database):
        self.settings = settings
        self.database = database
        self.metrics_cache: Dict[str, Any] = {}
    
    async def initialize(self):
        """Initialize analytics system"""
        logger.info("📊 Initializing Analytics System...")
        logger.info("✅ Analytics System ready")
    
    async def record_interaction(
        self,
        merchant_id: str,
        customer_phone: str,
        intent_type: ConversationType,
        language: Language,
        response_time: float
    ):
        """Record interaction metrics"""
        logger.info(
            f"📊 Recording interaction: {merchant_id} | {intent_type} | "
            f"{language} | {response_time:.3f}s"
        )
    
    async def log_interaction(
        self,
        merchant_id: str,
        customer_phone: str,
        message_type: MessageType,
        intent_type: ConversationType,
        language: Language,
        confidence: float,
        requires_human: bool
    ):
        """Log detailed interaction data"""
        interaction_data = {
            "merchant_id": merchant_id,
            "customer_phone": customer_phone,
            "message_type": message_type,
            "intent_type": intent_type,
            "language": language,
            "confidence": confidence,
            "requires_human": requires_human,
            "timestamp": datetime.utcnow()
        }
        
        logger.info(f"📝 Logging interaction: {interaction_data}")
    
    async def get_merchant_analytics(
        self,
        merchant_id: str,
        days: int = 7
    ) -> Dict[str, Any]:
        """Get analytics for specific merchant"""
        
        # Mock analytics data for demo
        return {
            "merchant_id": merchant_id,
            "period_days": days,
            "total_conversations": 127,
            "active_conversations": 23,
            "conversion_rate": 68.5,
            "average_response_time": 285,
            "customer_satisfaction": 4.2,
            "language_distribution": {
                "pidgin": 45,
                "english": 35,
                "yoruba": 12,
                "igbo": 5,
                "hausa": 3
            },
            "intent_distribution": {
                "product_inquiry": 45,
                "price_negotiation": 30,
                "order_creation": 15,
                "general_chat": 7,
                "complaint": 3
            },
            "peak_hours": {
                "9": 12,
                "10": 18,
                "11": 15,
                "12": 22,
                "13": 25,
                "14": 20,
                "15": 18,
                "16": 16,
                "17": 14,
                "18": 19,
                "19": 15,
                "20": 12
            },
            "generated_at": datetime.utcnow().isoformat()
        }