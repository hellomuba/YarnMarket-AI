"""
YarnMarket AI Conversation Engine
Core AI system for handling customer conversations with cultural intelligence
"""

import asyncio
import logging
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import json
import hashlib

import torch
from transformers import AutoTokenizer, AutoModel
import redis.asyncio as redis
from sqlalchemy.ext.asyncio import AsyncSession

from .models import (
    ConversationRequest, ConversationResponse, Intent, LanguageContext,
    NegotiationState, CustomerProfile, MerchantSettings, ConversationType,
    Language, MessageType, QuickReply
)
from .config import Settings
from .database import Database
from .language_detection import NigerianLanguageDetector
from .intent_classification import IntentClassifier
from .cultural_intelligence import CulturalIntelligence
from .negotiation_agent import HagglingAgent
from .voice_processor import VoiceProcessor
from .response_generator import ResponseGenerator
from .analytics import ConversationAnalytics

logger = logging.getLogger(__name__)


class YarnMarketConversationEngine:
    """
    Main conversation engine that orchestrates all AI components
    """
    
    def __init__(self, settings: Settings, database: Database):
        self.settings = settings
        self.database = database
        self.redis = None
        
        # AI Components
        self.language_detector: Optional[NigerianLanguageDetector] = None
        self.intent_classifier: Optional[IntentClassifier] = None
        self.cultural_intelligence: Optional[CulturalIntelligence] = None
        self.negotiation_agent: Optional[HagglingAgent] = None
        self.voice_processor: Optional[VoiceProcessor] = None
        self.response_generator: Optional[ResponseGenerator] = None
        self.analytics: Optional[ConversationAnalytics] = None
        
        # Cache
        self.conversation_cache: Dict[str, List[Dict]] = {}
        self.merchant_cache: Dict[str, MerchantSettings] = {}
        self.customer_cache: Dict[str, CustomerProfile] = {}
        
    async def initialize(self):
        """Initialize all components"""
        logger.info("🔧 Initializing YarnMarket Conversation Engine...")
        
        # Initialize Redis
        self.redis = redis.from_url(self.settings.redis_url)
        
        # Initialize AI components
        logger.info("Loading language detection model...")
        self.language_detector = NigerianLanguageDetector(self.settings)
        await self.language_detector.initialize()
        
        logger.info("Loading intent classification model...")
        self.intent_classifier = IntentClassifier(self.settings)
        await self.intent_classifier.initialize()
        
        logger.info("Loading cultural intelligence system...")
        self.cultural_intelligence = CulturalIntelligence(self.settings)
        await self.cultural_intelligence.initialize()
        
        logger.info("Loading negotiation agent...")
        self.negotiation_agent = HagglingAgent(self.settings)
        await self.negotiation_agent.initialize()
        
        logger.info("Loading voice processor...")
        self.voice_processor = VoiceProcessor(self.settings)
        await self.voice_processor.initialize()
        
        logger.info("Loading response generator...")
        self.response_generator = ResponseGenerator(self.settings)
        await self.response_generator.initialize()
        
        logger.info("Loading analytics system...")
        self.analytics = ConversationAnalytics(self.settings, self.database)
        await self.analytics.initialize()
        
        logger.info("✅ YarnMarket Conversation Engine initialized successfully")
    
    async def process_message(self, request: ConversationRequest) -> ConversationResponse:
        """
        Main entry point for processing customer messages
        """
        start_time = datetime.utcnow()
        
        try:
            # Get merchant settings
            merchant = await self.get_merchant_settings(request.merchant_id)
            
            # Get customer profile
            customer = await self.get_customer_profile(request.customer_phone)
            
            # Get conversation history
            history = await self.get_conversation_history(
                request.customer_phone,
                request.merchant_id
            )
            
            # Detect language and cultural context
            language_context = await self.language_detector.analyze(
                request.message.text,
                history,
                customer.preferred_language
            )
            
            # Extract intent
            intent = await self.intent_classifier.classify(
                text=request.message.text,
                language_context=language_context,
                conversation_history=history,
                merchant_context=merchant.business_type
            )
            
            # Route to appropriate handler
            response = await self._route_conversation(
                request=request,
                intent=intent,
                language_context=language_context,
                merchant=merchant,
                customer=customer,
                history=history
            )
            
            # Store conversation
            await self._store_conversation(
                request=request,
                response=response,
                intent=intent,
                processing_time=(datetime.utcnow() - start_time).total_seconds()
            )
            
            # Update analytics
            await self.analytics.record_interaction(
                merchant_id=request.merchant_id,
                customer_phone=request.customer_phone,
                intent_type=intent.type,
                language=language_context.primary_language,
                response_time=(datetime.utcnow() - start_time).total_seconds()
            )
            
            return response
            
        except Exception as e:
            logger.error(f"Error processing message: {str(e)}", exc_info=True)
            
            # Generate fallback response
            return ConversationResponse(
                text="Sorry, I'm having a small issue right now. Please give me a moment to get back to you! 🙏",
                language=Language.ENGLISH,
                intent_type=ConversationType.GENERAL_CHAT,
                confidence=0.5,
                requires_human=True
            )
    
    async def process_voice_message(self, request: ConversationRequest) -> ConversationResponse:
        """
        Process voice messages using Whisper transcription
        """
        try:
            # Transcribe audio
            voice_result = await self.voice_processor.process_voice_note(
                audio_url=request.audio_url,
                expected_languages=["pidgin", "english", "yoruba", "igbo", "hausa"]
            )
            
            # Create text message from transcription
            text_request = ConversationRequest(
                message=request.message.model_copy(update={
                    "text": voice_result.text,
                    "type": MessageType.TEXT
                }),
                merchant_id=request.merchant_id,
                customer_phone=request.customer_phone,
                conversation_history=request.conversation_history
            )
            
            # Process as text
            response = await self.process_message(text_request)
            
            # Add voice metadata
            response.confidence *= voice_result.confidence
            
            return response
            
        except Exception as e:
            logger.error(f"Error processing voice message: {str(e)}")
            return ConversationResponse(
                text="Sorry, I couldn't understand your voice message. Could you please type or send it again?",
                language=Language.ENGLISH,
                intent_type=ConversationType.GENERAL_CHAT,
                confidence=0.3,
                requires_human=True
            )
    
    async def _route_conversation(
        self,
        request: ConversationRequest,
        intent: Intent,
        language_context: LanguageContext,
        merchant: MerchantSettings,
        customer: CustomerProfile,
        history: List[Dict[str, Any]]
    ) -> ConversationResponse:
        """
        Route conversation to appropriate handler based on intent
        """
        
        if intent.type == ConversationType.GREETING:
            return await self._handle_greeting(
                request, language_context, merchant, customer
            )
            
        elif intent.type == ConversationType.PRODUCT_INQUIRY:
            return await self._handle_product_inquiry(
                request, intent, language_context, merchant, history
            )
            
        elif intent.type == ConversationType.PRICE_NEGOTIATION:
            return await self._handle_price_negotiation(
                request, intent, language_context, merchant, customer, history
            )
            
        elif intent.type == ConversationType.ORDER_CREATION:
            return await self._handle_order_creation(
                request, intent, language_context, merchant, customer
            )
            
        elif intent.type == ConversationType.COMPLAINT:
            return await self._handle_complaint(
                request, intent, language_context, merchant
            )
            
        else:  # GENERAL_CHAT
            return await self._handle_general_chat(
                request, intent, language_context, merchant
            )
    
    async def _handle_greeting(
        self,
        request: ConversationRequest,
        language_context: LanguageContext,
        merchant: MerchantSettings,
        customer: CustomerProfile
    ) -> ConversationResponse:
        """Handle customer greetings"""
        
        # Generate culturally appropriate greeting
        greeting_text = await self.cultural_intelligence.generate_greeting(
            language=language_context.primary_language,
            time_of_day=datetime.now().hour,
            customer_name=customer.name,
            business_name=merchant.business_name,
            formality_level=language_context.formality_level
        )
        
        # Add quick replies for common actions
        quick_replies = [
            QuickReply(id="products", title="View Products", payload="show_products"),
            QuickReply(id="help", title="Help", payload="need_help"),
            QuickReply(id="contact", title="Contact Info", payload="contact_info")
        ]
        
        return ConversationResponse(
            text=greeting_text,
            language=language_context.primary_language,
            intent_type=ConversationType.GREETING,
            confidence=0.9,
            quick_replies=quick_replies
        )
    
    async def _handle_product_inquiry(
        self,
        request: ConversationRequest,
        intent: Intent,
        language_context: LanguageContext,
        merchant: MerchantSettings,
        history: List[Dict[str, Any]]
    ) -> ConversationResponse:
        """Handle product inquiries and recommendations"""
        
        # Extract product information from intent
        product_names = intent.product_names
        budget = intent.price_mentioned
        
        # Get product recommendations
        products = await self.database.get_products(
            merchant_id=merchant.merchant_id,
            category=None,
            max_price=budget,
            search_terms=product_names
        )
        
        if not products:
            response_text = await self.cultural_intelligence.generate_no_products_response(
                language=language_context.primary_language,
                search_terms=product_names,
                business_type=merchant.business_type
            )
        else:
            response_text = await self.cultural_intelligence.generate_product_showcase(
                language=language_context.primary_language,
                products=products[:3],  # Show top 3
                customer_budget=budget
            )
        
        return ConversationResponse(
            text=response_text,
            language=language_context.primary_language,
            intent_type=ConversationType.PRODUCT_INQUIRY,
            confidence=intent.confidence,
            mentioned_products=[p.name for p in products[:3]]
        )
    
    async def _handle_price_negotiation(
        self,
        request: ConversationRequest,
        intent: Intent,
        language_context: LanguageContext,
        merchant: MerchantSettings,
        customer: CustomerProfile,
        history: List[Dict[str, Any]]
    ) -> ConversationResponse:
        """Handle price negotiations using RL agent"""
        
        # Get current negotiation state
        negotiation_key = f"negotiation:{request.customer_phone}:{request.merchant_id}"
        negotiation_data = await self.redis.get(negotiation_key)
        
        if negotiation_data:
            negotiation_state = NegotiationState.model_validate_json(negotiation_data)
        else:
            # Start new negotiation
            product_id = intent.entities.get("product_id")
            if not product_id:
                return ConversationResponse(
                    text="Which product are you interested in negotiating for?",
                    language=language_context.primary_language,
                    intent_type=ConversationType.PRODUCT_INQUIRY,
                    confidence=0.8
                )
            
            product = await self.database.get_product(product_id)
            negotiation_state = NegotiationState(
                product_id=product_id,
                original_price=product.price
            )
        
        # Update negotiation with customer offer
        if intent.price_mentioned:
            negotiation_state.customer_offer = intent.price_mentioned
            negotiation_state.round_number += 1
            negotiation_state.customer_sentiment = intent.sentiment
            
            negotiation_state.add_offer(
                offer=intent.price_mentioned,
                sender="customer",
                response=request.message.text
            )
        
        # Get negotiation strategy from RL agent
        strategy = await self.negotiation_agent.get_strategy(
            negotiation_state=negotiation_state,
            merchant_rules=merchant,
            customer_profile=customer
        )
        
        # Generate culturally appropriate response
        response_text = await self.cultural_intelligence.generate_negotiation_response(
            strategy=strategy,
            negotiation_state=negotiation_state,
            language=language_context.primary_language,
            merchant_personality=merchant.personality_traits
        )
        
        # Update negotiation state
        if strategy.counter_offer:
            negotiation_state.current_counter = strategy.counter_offer
            negotiation_state.add_offer(
                offer=strategy.counter_offer,
                sender="merchant",
                response=response_text
            )
        
        # Store updated negotiation state
        await self.redis.setex(
            negotiation_key,
            timedelta(hours=24),
            negotiation_state.model_dump_json()
        )
        
        return ConversationResponse(
            text=response_text,
            language=language_context.primary_language,
            intent_type=ConversationType.PRICE_NEGOTIATION,
            confidence=0.85,
            price_mentioned=strategy.counter_offer,
            negotiation_stage=strategy.action_type,
            quick_replies=strategy.suggested_replies
        )
    
    async def _handle_order_creation(
        self,
        request: ConversationRequest,
        intent: Intent,
        language_context: LanguageContext,
        merchant: MerchantSettings,
        customer: CustomerProfile
    ) -> ConversationResponse:
        """Handle order creation and payment"""
        
        # Extract order details
        products = intent.entities.get("products", [])
        quantity = intent.entities.get("quantity", 1)
        agreed_price = intent.price_mentioned
        
        if not products:
            return ConversationResponse(
                text="What would you like to order?",
                language=language_context.primary_language,
                intent_type=ConversationType.PRODUCT_INQUIRY,
                confidence=0.8
            )
        
        # Calculate total
        total_amount = agreed_price if agreed_price else sum(p.price for p in products) * quantity
        
        # Generate order confirmation
        response_text = await self.cultural_intelligence.generate_order_confirmation(
            language=language_context.primary_language,
            products=products,
            quantity=quantity,
            total_amount=total_amount,
            customer_name=customer.name
        )
        
        # Create order in database
        order_id = await self.database.create_order(
            merchant_id=merchant.merchant_id,
            customer_phone=customer.phone_number,
            products=products,
            quantity=quantity,
            total_amount=total_amount
        )
        
        return ConversationResponse(
            text=response_text,
            language=language_context.primary_language,
            intent_type=ConversationType.ORDER_CREATION,
            confidence=0.9,
            quick_replies=[
                QuickReply(id="pay_now", title="Pay Now", payload=f"pay_{order_id}"),
                QuickReply(id="pay_later", title="Pay on Delivery", payload=f"pod_{order_id}")
            ]
        )
    
    async def _handle_complaint(
        self,
        request: ConversationRequest,
        intent: Intent,
        language_context: LanguageContext,
        merchant: MerchantSettings
    ) -> ConversationResponse:
        """Handle customer complaints with empathy"""
        
        response_text = await self.cultural_intelligence.generate_complaint_response(
            language=language_context.primary_language,
            complaint_text=request.message.text,
            sentiment=intent.sentiment,
            business_name=merchant.business_name
        )
        
        return ConversationResponse(
            text=response_text,
            language=language_context.primary_language,
            intent_type=ConversationType.COMPLAINT,
            confidence=0.8,
            requires_human=intent.sentiment < -0.5  # Escalate very negative complaints
        )
    
    async def _handle_general_chat(
        self,
        request: ConversationRequest,
        intent: Intent,
        language_context: LanguageContext,
        merchant: MerchantSettings
    ) -> ConversationResponse:
        """Handle general conversation"""
        
        response_text = await self.cultural_intelligence.generate_general_response(
            language=language_context.primary_language,
            customer_message=request.message.text,
            business_context=merchant.business_type,
            personality=merchant.personality_traits
        )
        
        return ConversationResponse(
            text=response_text,
            language=language_context.primary_language,
            intent_type=ConversationType.GENERAL_CHAT,
            confidence=intent.confidence
        )
    
    async def get_merchant_settings(self, merchant_id: str) -> MerchantSettings:
        """Get merchant settings with caching"""
        if merchant_id in self.merchant_cache:
            return self.merchant_cache[merchant_id]
        
        merchant = await self.database.get_merchant(merchant_id)
        self.merchant_cache[merchant_id] = merchant
        return merchant
    
    async def get_customer_profile(self, phone_number: str) -> CustomerProfile:
        """Get customer profile with caching"""
        if phone_number in self.customer_cache:
            return self.customer_cache[phone_number]
        
        customer = await self.database.get_customer(phone_number)
        if not customer:
            customer = CustomerProfile(phone_number=phone_number)
            await self.database.create_customer(customer)
        
        self.customer_cache[phone_number] = customer
        return customer
    
    async def get_conversation_history(
        self,
        customer_phone: str,
        merchant_id: str,
        limit: int = 20
    ) -> List[Dict[str, Any]]:
        """Get conversation history"""
        cache_key = f"history:{customer_phone}:{merchant_id}"
        
        if cache_key in self.conversation_cache:
            return self.conversation_cache[cache_key][-limit:]
        
        history = await self.database.get_conversation_history(
            customer_phone, merchant_id, limit
        )
        
        self.conversation_cache[cache_key] = history
        return history
    
    async def _store_conversation(
        self,
        request: ConversationRequest,
        response: ConversationResponse,
        intent: Intent,
        processing_time: float
    ):
        """Store conversation in database and cache"""
        conversation_data = {
            "customer_phone": request.customer_phone,
            "merchant_id": request.merchant_id,
            "customer_message": request.message.text,
            "ai_response": response.text,
            "intent_type": intent.type,
            "language": response.language,
            "confidence": response.confidence,
            "processing_time": processing_time,
            "timestamp": datetime.utcnow()
        }
        
        # Store in database
        await self.database.store_conversation(conversation_data)
        
        # Update cache
        cache_key = f"history:{request.customer_phone}:{request.merchant_id}"
        if cache_key in self.conversation_cache:
            self.conversation_cache[cache_key].append(conversation_data)
            # Keep only recent messages
            if len(self.conversation_cache[cache_key]) > self.settings.max_conversation_history:
                self.conversation_cache[cache_key] = self.conversation_cache[cache_key][-self.settings.max_conversation_history:]
    
    async def log_interaction(
        self,
        request: ConversationRequest,
        response: ConversationResponse
    ):
        """Log interaction for analytics"""
        await self.analytics.log_interaction(
            merchant_id=request.merchant_id,
            customer_phone=request.customer_phone,
            message_type=request.message.type,
            intent_type=response.intent_type,
            language=response.language,
            confidence=response.confidence,
            requires_human=response.requires_human
        )
    
    async def train_merchant_model(
        self,
        merchant_id: str,
        training_data: Dict[str, Any]
    ):
        """Train merchant-specific model"""
        # This would implement merchant-specific fine-tuning
        # For MVP, we'll use the base models
        logger.info(f"Training merchant model for {merchant_id}")
    
    async def get_merchant_analytics(
        self,
        merchant_id: str,
        days: int = 7
    ) -> Dict[str, Any]:
        """Get analytics for a merchant"""
        return await self.analytics.get_merchant_analytics(merchant_id, days)
    
    async def cleanup(self):
        """Cleanup resources"""
        if self.redis:
            await self.redis.close()
        
        logger.info("🧹 YarnMarket Conversation Engine cleanup complete")