"""
Intent Classification for YarnMarket AI
Stub implementation for demo
"""

import logging
from typing import List, Dict, Any
from .models import Intent, ConversationType, Language, LanguageContext
from .config import Settings

logger = logging.getLogger(__name__)


class IntentClassifier:
    """Intent classification system"""
    
    def __init__(self, settings: Settings):
        self.settings = settings
    
    async def initialize(self):
        """Initialize intent classifier"""
        logger.info("🎯 Initializing Intent Classifier...")
        logger.info("✅ Intent Classifier ready")
    
    async def classify(
        self,
        text: str,
        language_context: LanguageContext,
        conversation_history: List[Dict[str, Any]],
        merchant_context: str
    ) -> Intent:
        """Classify customer intent"""
        
        text_lower = text.lower()
        
        # Simple keyword-based classification for demo
        if any(word in text_lower for word in ['how much', 'price', 'cost', '₦', 'naira']):
            intent_type = ConversationType.PRODUCT_INQUIRY
        elif any(word in text_lower for word in ['reduce', 'discount', 'cheap', 'lower', 'negotiate']):
            intent_type = ConversationType.PRICE_NEGOTIATION
        elif any(word in text_lower for word in ['buy', 'order', 'take', 'purchase']):
            intent_type = ConversationType.ORDER_CREATION
        elif any(word in text_lower for word in ['hello', 'hi', 'good morning', 'good afternoon']):
            intent_type = ConversationType.GREETING
        elif any(word in text_lower for word in ['problem', 'complaint', 'wrong', 'bad']):
            intent_type = ConversationType.COMPLAINT
        else:
            intent_type = ConversationType.GENERAL_CHAT
        
        # Extract price if mentioned
        price_mentioned = None
        if '₦' in text:
            try:
                price_str = text.split('₦')[1].split()[0].replace(',', '')
                price_mentioned = float(price_str)
            except (IndexError, ValueError):
                pass
        
        return Intent(
            type=intent_type,
            confidence=0.85,
            language=language_context.primary_language,
            entities={"price_mentioned": price_mentioned},
            price_mentioned=price_mentioned,
            sentiment=0.1 if 'please' in text_lower else -0.1 if 'bad' in text_lower else 0.0
        )