"""
Cultural Intelligence System for YarnMarket AI
Generates culturally authentic Nigerian market responses with proper etiquette and haggling patterns
"""

import random
import re
from typing import Dict, List, Optional, Any
from datetime import datetime, time
import logging

from .models import Language, Product, MerchantSettings, NegotiationState
from .config import Settings

logger = logging.getLogger(__name__)


class CulturalIntelligence:
    """
    Advanced cultural intelligence system for Nigerian market interactions
    """
    
    def __init__(self, settings: Settings):
        self.settings = settings
        
        # Nigerian market greeting templates by time and language
        self.greeting_templates = {
            Language.PIDGIN: {
                "morning": [
                    "Good morning o! How you dey today? Wetin you wan buy?",
                    "Morning my customer! You come early today o. How we fit help you?",
                    "Eh! Good morning! Welcome to our shop. Wetin dey worry you today?",
                    "Good morning sir/madam! Hope you sleep well? Come make we do business!",
                ],
                "afternoon": [
                    "Good afternoon! You dey try well well to come today. Wetin you need?",
                    "Afternoon my brother/sister! Hope say afternoon dey treat you well?",
                    "Welcome! Good afternoon o! Come make we see wetin we fit do for you today.",
                    "Afternoon customer! You come at the right time. Wetin you wan buy?",
                ],
                "evening": [
                    "Good evening sir/madam! You still dey work hard o. Wetin bring you come?",
                    "Evening my person! Hope your day go well? Make we do quick business.",
                    "Good evening o! Even for evening you still dey find quality things. I respect you!",
                    "Evening my customer! You know where to find original things. Wetin you need?",
                ]
            },
            Language.ENGLISH: {
                "morning": [
                    "Good morning! Welcome to our store. How can I help you today?",
                    "Morning! Thank you for coming early. What are you looking for?",
                    "Good morning sir/madam! Hope you're doing well. What brings you here?",
                    "Morning! I appreciate your visit. What can I show you today?",
                ],
                "afternoon": [
                    "Good afternoon! Welcome to our shop. What can I help you with?",
                    "Afternoon! Thank you for stopping by. How may I assist you?",
                    "Good afternoon sir/madam! What brings you to our store today?",
                    "Afternoon! I'm happy to help. What are you looking for?",
                ],
                "evening": [
                    "Good evening! Thank you for coming even this late. How can I help?",
                    "Evening! I appreciate your visit. What can I show you?",
                    "Good evening sir/madam! What brings you here this evening?",
                    "Evening! Thank you for choosing us. How may I assist you?",
                ]
            },
            Language.YORUBA: [
                "E ku aaro o! (Good morning!) Se o wa wa ra nkan? (Are you here to buy something?)",
                "E ku osan o! (Good afternoon!) Kini o fe ra? (What do you want to buy?)",
                "E ku irole o! (Good evening!) Se o wa ba wa ni shop wa? (Are you here to visit our shop?)"
            ]
        }
        
        # Nigerian haggling/negotiation templates
        self.negotiation_templates = {
            Language.PIDGIN: {
                "counter_soft": [
                    "Ah customer! {offer} go wound me o! But because say na you, make we do {counter}. Na final price be that o!",
                    "My person, {offer} no go work at all! But I go manage {counter} for you because you be my customer.",
                    "Oga/Madam, you too sabi price well well! {offer} dey pain me o, but make we meet at {counter}.",
                    "Ah! You want make I close shop? {offer} no reach at all o! Best I fit do na {counter} sharp sharp.",
                ],
                "counter_firm": [
                    "My friend, {offer}? You wan make I sell at loss? I no dey sell fake o! {counter} na my final word!",
                    "Oga, {offer} no reach at all at all! This na original quality. {counter} or nothing!",
                    "Customer, be serious! {offer} for this kind quality? Make we talk {counter} finish!",
                    "You dey craze? {offer} for this thing wey cost me plenty money? {counter} final answer!"
                ],
                "bundle_offer": [
                    "Okay make I help you! Instead of {individual_price} each, I go give you {bundle_quantity} for {bundle_price}. Na better deal be that!",
                    "You wan save money abi? Buy {bundle_quantity} pieces make I give you {bundle_price}. You go thank me later!",
                    "Customer, you get sense! Take {bundle_quantity} for {bundle_price}. E better pass to buy one by one.",
                ],
                "acceptance": [
                    "Ah! You get good eye for business! {price} deal! Make we package am for you sharp sharp!",
                    "See negotiation! {price} accepted! You sabi do business well well!",
                    "Okay, you win! {price} final. But na because you be correct customer o!",
                    "Alright, make we close the deal at {price}! You drive hard bargain o!"
                ],
                "rejection": [
                    "I sorry o, but {offer} no possible at all! Maybe you fit check other place.",
                    "My hands dey tied. {offer} go make me lose money. I no fit do am!",
                    "Customer, I like you but {offer} no go work. The thing cost me pass that price sef.",
                ]
            },
            Language.ENGLISH: {
                "counter_soft": [
                    "That's quite low sir/madam, but let's meet halfway at {counter}. That's my best offer.",
                    "{offer} is below cost price, but I can do {counter} for you as a valued customer.",
                    "I appreciate your offer of {offer}, but {counter} would be fair for both of us.",
                    "Let me be honest, {offer} won't work, but {counter} is something I can consider.",
                ],
                "counter_firm": [
                    "{offer} is not realistic for this quality. My final price is {counter}.",
                    "I'm sorry but {offer} is too low. {counter} is the best I can do.",
                    "This is premium quality. {offer} doesn't match the value. {counter} is fair.",
                    "I can't go below {counter}. That's already a very good price."
                ],
                "acceptance": [
                    "Alright, {price} it is! You've got yourself a deal!",
                    "Okay, I accept {price}. Thank you for your business!",
                    "{price} is fair. Let me package this for you right away.",
                    "Deal! {price} final. You're a good negotiator!"
                ]
            }
        }
        
        # Product showcase templates
        self.product_showcase_templates = {
            Language.PIDGIN: [
                "See this fine {product}! Na original {brand} be this o! Only {price} you go get am. E no get duplicate anywhere!",
                "Customer, this {product} na fire! Look the quality sef - {description}. For just {price}, na steal be this!",
                "Ah! You get good eye! This {product} dey sell like pure water. {price} naira and na your own!",
                "This {product} na the latest in market o! Very limited edition. {price} and you go be the owner!"
            ],
            Language.ENGLISH: [
                "Check out this amazing {product}! It's original {brand} quality. Only {price} and it's yours.",
                "This {product} is really popular! The quality is exceptional - {description}. Just {price}!",
                "You have great taste! This {product} is selling very fast. {price} and we can wrap it for you.",
                "This is our premium {product}! Limited stock available. {price} for this quality is a great deal."
            ]
        }
        
        # Trust-building phrases
        self.trust_builders = {
            Language.PIDGIN: [
                "I no dey sell fake o! All my things na original!",
                "You fit ask anybody for this area, I dey sell quality things!",
                "Na God go bless you if you buy from me!",
                "I get plenty customers wey dey come back because my things dey last!",
                "Check am well well, you go see say na good quality!",
                "I get receipt and guarantee for all my products!",
                "If anything happen to this thing, just come back to me!"
            ],
            Language.ENGLISH: [
                "I only sell original, quality products!",
                "You can ask anyone around here about my business reputation.",
                "I have many repeat customers because of our quality.",
                "All our products come with warranty and receipt.",
                "Feel free to inspect the quality before you buy.",
                "Customer satisfaction is our priority!"
            ]
        }
        
        # Complaint handling templates
        self.complaint_templates = {
            Language.PIDGIN: [
                "Ah! I sorry well well for this wahala! No vex abeg, make we sort am out sharp sharp!",
                "Customer, this thing pain me o! E no supposed happen like this. Make we find solution!",
                "I sorry for the trouble! Na my fault be this. How we go settle am now?",
                "Abeg no vex! This na genuine mistake. Make we fix am together!"
            ],
            Language.ENGLISH: [
                "I sincerely apologize for this inconvenience! Let's resolve it immediately.",
                "I'm very sorry about this issue. This shouldn't have happened. How can we fix it?",
                "Please accept my apologies for the trouble. Let's find a solution together.",
                "I take full responsibility for this. How can I make it right for you?"
            ]
        }
        
        # Religious and cultural expressions
        self.cultural_expressions = {
            "blessings": ["God go bless you!", "May Allah bless you!", "God dey your side!"],
            "gratitude": ["Thank God o!", "Alhamdulillah!", "God be praised!"],
            "encouragement": ["E go better!", "Things go work out!", "God dey!"],
            "farewell": ["Safe journey!", "Till we meet again!", "God protect you!"]
        }
        
        # Time-based contexts
        self.time_contexts = {
            "rush_hours": [7, 8, 17, 18, 19],  # Morning and evening rush
            "lunch_time": [12, 13, 14],
            "quiet_hours": [10, 11, 15, 16],
            "closing_time": [20, 21, 22]
        }
    
    async def initialize(self):
        """Initialize cultural intelligence system"""
        logger.info("🌍 Initializing Cultural Intelligence System...")
        logger.info("✅ Cultural Intelligence System ready")
    
    async def generate_greeting(
        self,
        language: Language,
        time_of_day: int,
        customer_name: Optional[str] = None,
        business_name: Optional[str] = None,
        formality_level: float = 0.5
    ) -> str:
        """
        Generate culturally appropriate greeting based on time and context
        """
        # Determine time period
        if 5 <= time_of_day < 12:
            period = "morning"
        elif 12 <= time_of_day < 17:
            period = "afternoon"
        else:
            period = "evening"
        
        # Get appropriate templates
        if language == Language.PIDGIN:
            templates = self.greeting_templates[Language.PIDGIN][period]
        elif language == Language.ENGLISH:
            templates = self.greeting_templates[Language.ENGLISH][period]
        else:
            # Fallback to English for other languages
            templates = self.greeting_templates[Language.ENGLISH][period]
        
        # Select template
        greeting = random.choice(templates)
        
        # Personalize if customer name is available
        if customer_name:
            greeting = greeting.replace("sir/madam", customer_name)
            greeting = greeting.replace("customer", customer_name)
        else:
            # Choose appropriate title based on formality
            if formality_level > 0.7:
                greeting = greeting.replace("sir/madam", "sir" if random.random() > 0.5 else "madam")
            else:
                greeting = greeting.replace("sir/madam", "my friend")
        
        # Add business context if available
        if business_name and random.random() > 0.7:
            greeting += f" Welcome to {business_name}!"
        
        return greeting
    
    async def generate_negotiation_response(
        self,
        strategy: Dict[str, Any],
        negotiation_state: NegotiationState,
        language: Language,
        merchant_personality: Dict[str, float]
    ) -> str:
        """
        Generate culturally appropriate negotiation response
        """
        action = strategy.get("action_type", "counter")
        counter_price = strategy.get("counter_offer")
        customer_offer = negotiation_state.customer_offer
        
        # Determine firmness level based on negotiation round and merchant personality
        firmness = merchant_personality.get("persistence", 0.7)
        if negotiation_state.round_number > 3:
            firmness += 0.2  # Get firmer as negotiation progresses
        
        # Select appropriate template category
        if action == "accept":
            category = "acceptance"
        elif action == "reject":
            category = "rejection"
        elif action == "bundle":
            category = "bundle_offer"
        else:  # counter
            category = "counter_firm" if firmness > 0.6 else "counter_soft"
        
        # Get templates for the language
        templates = self.negotiation_templates.get(language, {}).get(category, [])
        if not templates:
            templates = self.negotiation_templates[Language.PIDGIN][category]
        
        # Select and format template
        template = random.choice(templates)
        
        # Format the template
        formatted_response = self._format_negotiation_template(
            template, customer_offer, counter_price, strategy
        )
        
        # Add trust builders occasionally
        if random.random() > 0.7 and category in ["counter_soft", "counter_firm"]:
            trust_builder = random.choice(self.trust_builders.get(language, []))
            formatted_response += f" {trust_builder}"
        
        # Add cultural expression occasionally
        if random.random() > 0.8:
            if action == "accept":
                expression = random.choice(self.cultural_expressions["blessings"])
                formatted_response += f" {expression}"
        
        return formatted_response
    
    def _format_negotiation_template(
        self,
        template: str,
        customer_offer: Optional[float],
        counter_price: Optional[float],
        strategy: Dict[str, Any]
    ) -> str:
        """Format negotiation template with appropriate values"""
        
        # Format currency
        def format_currency(amount):
            if amount is None:
                return "the price"
            return f"₦{amount:,.0f}" if amount >= 1000 else f"₦{amount:.0f}"
        
        template = template.replace("{offer}", format_currency(customer_offer))
        template = template.replace("{counter}", format_currency(counter_price))
        template = template.replace("{price}", format_currency(counter_price or customer_offer))
        
        # Handle bundle offers
        if "bundle_quantity" in template:
            quantity = strategy.get("bundle_quantity", 3)
            bundle_price = strategy.get("bundle_price", counter_price)
            individual_price = strategy.get("individual_price", counter_price)
            
            template = template.replace("{bundle_quantity}", str(quantity))
            template = template.replace("{bundle_price}", format_currency(bundle_price))
            template = template.replace("{individual_price}", format_currency(individual_price))
        
        return template
    
    async def generate_product_showcase(
        self,
        language: Language,
        products: List[Product],
        customer_budget: Optional[float] = None
    ) -> str:
        """
        Generate product showcase with cultural flair
        """
        if not products:
            return "Sorry, we don't have that item in stock right now."
        
        # Select template
        templates = self.product_showcase_templates.get(language, [])
        if not templates:
            templates = self.product_showcase_templates[Language.PIDGIN]
        
        responses = []
        
        for product in products[:3]:  # Show maximum 3 products
            template = random.choice(templates)
            
            # Format the template
            formatted = template.format(
                product=product.name,
                brand=product.category.title(),
                price=self._format_currency(product.price),
                description=product.description[:50] + "..." if len(product.description) > 50 else product.description
            )
            
            # Add budget consideration
            if customer_budget and product.price > customer_budget:
                if language == Language.PIDGIN:
                    formatted += f" But if budget tight, we fit negotiate small!"
                else:
                    formatted += f" We can discuss the price if needed!"
            
            responses.append(formatted)
        
        # Join responses
        if language == Language.PIDGIN:
            connector = "\n\nOr this one: "
        else:
            connector = "\n\nAlternatively: "
        
        full_response = connector.join(responses)
        
        # Add closing offer
        if len(products) > 3:
            if language == Language.PIDGIN:
                full_response += f"\n\nI get {len(products) - 3} more options if these ones no sweet you!"
            else:
                full_response += f"\n\nI have {len(products) - 3} more options if you'd like to see them!"
        
        return full_response
    
    async def generate_order_confirmation(
        self,
        language: Language,
        products: List[Product],
        quantity: int,
        total_amount: float,
        customer_name: Optional[str] = None
    ) -> str:
        """
        Generate order confirmation message
        """
        customer_title = customer_name or ("customer" if language == Language.PIDGIN else "sir/madam")
        
        if language == Language.PIDGIN:
            response = f"Perfect {customer_title}! So na {quantity} {products[0].name if products else 'item'} you wan buy for {self._format_currency(total_amount)} total. "
            response += "I go package am well well for you! You wan pay now or on delivery?"
        else:
            response = f"Excellent {customer_title}! So you want {quantity} {products[0].name if products else 'item'} for a total of {self._format_currency(total_amount)}. "
            response += "I'll package it properly for you! Would you prefer to pay now or on delivery?"
        
        return response
    
    async def generate_complaint_response(
        self,
        language: Language,
        complaint_text: str,
        sentiment: float,
        business_name: Optional[str] = None
    ) -> str:
        """
        Generate empathetic complaint response
        """
        templates = self.complaint_templates.get(language, [])
        if not templates:
            templates = self.complaint_templates[Language.PIDGIN]
        
        response = random.choice(templates)
        
        # Add escalation for very negative sentiment
        if sentiment < -0.7:
            if language == Language.PIDGIN:
                response += " Make I call my oga to come talk to you personally!"
            else:
                response += " Let me get my manager to speak with you personally!"
        
        # Add business name if available
        if business_name:
            if language == Language.PIDGIN:
                response += f" {business_name} no dey disappoint customers!"
            else:
                response += f" {business_name} values every customer!"
        
        return response
    
    async def generate_general_response(
        self,
        language: Language,
        customer_message: str,
        business_context: str,
        personality: Dict[str, float]
    ) -> str:
        """
        Generate general conversational response
        """
        friendliness = personality.get("friendliness", 0.8)
        humor = personality.get("humor", 0.6)
        
        # Simple rule-based responses for common queries
        message_lower = customer_message.lower()
        
        if any(word in message_lower for word in ["location", "address", "where"]):
            if language == Language.PIDGIN:
                return "We dey [Location]. You fit find us easily! Just ask anybody around here."
            else:
                return "We're located at [Location]. You can easily find us by asking anyone in the area."
        
        elif any(word in message_lower for word in ["hours", "time", "open", "close"]):
            if language == Language.PIDGIN:
                return "We dey open from 8am to 8pm every day except Sunday. Saturday we close 6pm."
            else:
                return "We're open from 8am to 8pm daily except Sundays. Saturday closing time is 6pm."
        
        elif any(word in message_lower for word in ["delivery", "transport"]):
            if language == Language.PIDGIN:
                return "Yes o! We dey do delivery for Lagos. Delivery fee na ₦500 to ₦2000 depending on distance."
            else:
                return "Yes! We offer delivery within Lagos. Delivery fee ranges from ₦500 to ₦2000 depending on location."
        
        # Default friendly response
        if language == Language.PIDGIN:
            responses = [
                "I hear you well well! Anything else I fit do for you?",
                "That's true o! How we fit help you more?",
                "Okay na! Wetin else you need from us?",
                "I understand! Any other thing?"
            ]
        else:
            responses = [
                "I understand! How else can I help you?",
                "That makes sense! What else can I do for you?",
                "I see! Is there anything else you need?",
                "Got it! Any other questions?"
            ]
        
        return random.choice(responses)
    
    async def generate_no_products_response(
        self,
        language: Language,
        search_terms: List[str],
        business_type: str
    ) -> str:
        """
        Generate response when no products match customer inquiry
        """
        search_term = search_terms[0] if search_terms else "that item"
        
        if language == Language.PIDGIN:
            response = f"Ah! {search_term} don finish for now o! But no worry, I fit order am for you. "
            response += "Or make I show you similar thing wey we get? E fit even better pass the one you dey find!"
        else:
            response = f"Sorry, we're out of {search_term} at the moment! But I can order it for you. "
            response += "Or let me show you similar items we have in stock? They might be even better!"
        
        return response
    
    def _format_currency(self, amount: float) -> str:
        """Format currency in Nigerian Naira"""
        if amount >= 1000:
            return f"₦{amount:,.0f}"
        else:
            return f"₦{amount:.0f}"
    
    def _get_time_context(self, hour: int) -> str:
        """Get context based on time of day"""
        if hour in self.time_contexts["rush_hours"]:
            return "rush"
        elif hour in self.time_contexts["lunch_time"]:
            return "lunch"
        elif hour in self.time_contexts["quiet_hours"]:
            return "quiet"
        elif hour in self.time_contexts["closing_time"]:
            return "closing"
        else:
            return "normal"