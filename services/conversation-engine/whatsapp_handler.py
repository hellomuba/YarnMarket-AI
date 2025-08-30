"""
WhatsApp Handler for YarnMarket AI
Integrates WhatsApp with the conversation engine
"""

import os
import asyncio
import logging
from typing import Dict, List, Optional
from datetime import datetime
import openai
from whatsapp_service import whatsapp_service

logger = logging.getLogger(__name__)

class WhatsAppConversationHandler:
    """
    Handles WhatsApp messages using YarnMarket AI conversation engine
    """
    
    def __init__(self):
        self.openai_api_key = os.getenv('OPENAI_API_KEY')
        if self.openai_api_key:
            openai.api_key = self.openai_api_key
        
        # Simple conversation memory (in production, use Redis/Database)
        self.conversation_memory = {}
    
    async def process_whatsapp_message(self, webhook_data: Dict) -> Dict:
        """
        Process incoming WhatsApp message with AI
        
        Args:
            webhook_data (Dict): Webhook payload from WhatsApp
            
        Returns:
            Dict: Processing result
        """
        try:
            # Process the webhook data
            messages = whatsapp_service.process_webhook_message(webhook_data)
            
            if not messages:
                return {'status': 'no_messages', 'processed': 0}
            
            processed_count = 0
            
            for message in messages:
                try:
                    # Generate AI response
                    ai_response = await self.generate_ai_response(message)
                    
                    if ai_response:
                        # Send response via WhatsApp
                        result = whatsapp_service.send_message(
                            to=message['from'],
                            message=ai_response
                        )
                        
                        if result['success']:
                            processed_count += 1
                            logger.info(f"Successfully responded to {message['from']}")
                        else:
                            logger.error(f"Failed to send response: {result.get('error')}")
                
                except Exception as e:
                    logger.error(f"Error processing message {message.get('id')}: {str(e)}")
            
            return {
                'status': 'success',
                'processed': processed_count,
                'total': len(messages)
            }
            
        except Exception as e:
            logger.error(f"Error processing WhatsApp webhook: {str(e)}")
            return {'status': 'error', 'error': str(e)}
    
    async def generate_ai_response(self, message: Dict) -> Optional[str]:
        """
        Generate intelligent response using OpenAI or fallback logic
        
        Args:
            message (Dict): Processed message data
            
        Returns:
            Optional[str]: AI-generated response
        """
        try:
            customer_phone = message['from']
            customer_name = message.get('customer_name', 'Customer')
            message_content = message.get('content', '').strip()
            message_type = message.get('type', 'text')
            
            # Handle non-text messages
            if message_type != 'text':
                return self.handle_non_text_message(message, customer_name)
            
            # Handle button clicks
            if message.get('button_id'):
                return await self.handle_button_click(message, customer_name)
            
            # Get conversation context
            conversation_context = self.get_conversation_context(customer_phone)
            
            # Use OpenAI if available
            if self.openai_api_key and message_content:
                return await self.generate_openai_response(
                    message_content, customer_name, conversation_context
                )
            
            # Fallback to rule-based responses
            return self.generate_rule_based_response(message_content, customer_name)
            
        except Exception as e:
            logger.error(f"Error generating AI response: {str(e)}")
            return f"Hello {customer_name}! Thanks for your message. I'm having a technical issue right now, but I'll get back to you soon! 🔧"
    
    async def generate_openai_response(self, message: str, customer_name: str, context: List[str]) -> str:
        """
        Generate response using OpenAI API
        """
        try:
            # Build conversation context
            context_text = ""
            if context:
                context_text = f"Previous conversation:\n{chr(10).join(context[-5:])}\n\n"
            
            system_prompt = f"""You are YarnMarket AI, a friendly and professional shopping assistant for a Nigerian e-commerce platform.

Customer: {customer_name}
Platform: YarnMarket - Nigerian online marketplace

Your role:
- Help customers with product inquiries, prices, orders, and general shopping questions
- Use friendly Nigerian English and expressions where appropriate
- Be helpful, knowledgeable, and culturally aware
- Keep responses concise but informative
- Use emojis appropriately to make conversations engaging
- If asked about specific products/prices, ask for more details to help better

Guidelines:
- Always be respectful and professional
- Use "customer" or their name when referring to them
- Include relevant emojis (🛍️, 💰, 📦, 🎯, etc.)
- Keep responses under 160 characters when possible
- Ask clarifying questions to provide better help

{context_text}Customer's message: "{message}"

Respond as YarnMarket AI:"""

            response = await asyncio.to_thread(
                openai.ChatCompletion.create,
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": message}
                ],
                max_tokens=150,
                temperature=0.7
            )
            
            ai_response = response.choices[0].message.content.strip()
            
            # Update conversation memory
            self.update_conversation_memory(customer_name, message, ai_response)
            
            return ai_response
            
        except Exception as e:
            logger.error(f"OpenAI API error: {str(e)}")
            return self.generate_rule_based_response(message, customer_name)
    
    def generate_rule_based_response(self, message: str, customer_name: str) -> str:
        """
        Generate response using rule-based logic (fallback)
        """
        message_lower = message.lower()
        
        # Greeting responses
        if any(word in message_lower for word in ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening']):
            return f"Hello {customer_name}! 👋 Welcome to YarnMarket!\n\nI can help you with:\n🛍️ Product search\n💰 Pricing info\n📦 Order status\n🎯 Shopping advice\n\nWhat are you looking for today?"
        
        # Help requests
        elif any(word in message_lower for word in ['help', 'assist', 'support']):
            return f"I'm here to help, {customer_name}! 🤝\n\nI can assist with:\n• Finding products\n• Checking prices\n• Order tracking\n• Shopping recommendations\n• General questions\n\nWhat do you need help with?"
        
        # Product/shopping inquiries
        elif any(word in message_lower for word in ['product', 'item', 'buy', 'purchase', 'shop', 'looking for']):
            return f"Great! I'd love to help you find what you're looking for, {customer_name}! 🛍️\n\nCould you tell me more about the specific product or category you're interested in? This will help me provide you with the best options and prices! 💰"
        
        # Price inquiries
        elif any(word in message_lower for word in ['price', 'cost', 'how much', 'naira', '₦']):
            return f"I can definitely help with pricing information, {customer_name}! 💰\n\nPlease let me know which specific product you're interested in, and I'll get you the latest prices and any available discounts! 🎯"
        
        # Order tracking
        elif any(word in message_lower for word in ['order', 'delivery', 'shipping', 'tracking']):
            return f"Let me help you with your order, {customer_name}! 📦\n\nCould you please provide your order number or more details? I'll check the status and delivery information for you! 🚚"
        
        # Thanks/appreciation
        elif any(word in message_lower for word in ['thank', 'thanks', 'appreciate']):
            return f"You're very welcome, {customer_name}! 😊 I'm always here to help make your shopping experience better. Is there anything else you'd like to know? 🛍️"
        
        # Default response
        else:
            return f"Thanks for your message, {customer_name}! 🎯\n\nI received: \"{message[:50]}{'...' if len(message) > 50 else ''}\"\n\nI'm YarnMarket AI - your shopping assistant! How can I help you today? Type 'help' to see what I can do! 🛍️"
    
    def handle_non_text_message(self, message: Dict, customer_name: str) -> str:
        """
        Handle non-text messages (images, documents, etc.)
        """
        message_type = message.get('type')
        
        if message_type == 'image':
            return f"Thanks for the image, {customer_name}! 📸 I can see you've shared a photo. Are you looking for a similar product? Please describe what you're looking for and I'll help you find it! 🛍️"
        
        elif message_type == 'document':
            return f"I received your document, {customer_name}! 📄 If it's related to an order or product inquiry, please let me know how I can help you with it! 🤝"
        
        elif message_type == 'audio':
            return f"Thanks for the voice message, {customer_name}! 🎵 I'm currently a text-based assistant. Could you please type your message so I can help you better? 📝"
        
        else:
            return f"Hello {customer_name}! I received your {message_type} message. How can I assist you with your shopping needs today? 🛍️"
    
    async def handle_button_click(self, message: Dict, customer_name: str) -> str:
        """
        Handle interactive button clicks
        """
        button_id = message.get('button_id')
        button_title = message.get('button_title')
        
        if button_id == 'help':
            return f"Here's how I can help you, {customer_name}! 🤝\n\n🛍️ Product Search\n💰 Price Checking\n📦 Order Tracking\n🎯 Shopping Advice\n\nWhat would you like to do?"
        
        elif button_id == 'products':
            return f"Let's find you some great products, {customer_name}! 🛍️\n\nWhat category are you interested in?\n• Electronics\n• Fashion\n• Home & Garden\n• Beauty & Health\n\nOr just tell me what you're looking for!"
        
        else:
            return f"You clicked: {button_title} 👆\n\nHow can I help you with that, {customer_name}?"
    
    def get_conversation_context(self, customer_phone: str) -> List[str]:
        """
        Get recent conversation context for the customer
        """
        return self.conversation_memory.get(customer_phone, [])
    
    def update_conversation_memory(self, customer_phone: str, user_message: str, ai_response: str):
        """
        Update conversation memory
        """
        if customer_phone not in self.conversation_memory:
            self.conversation_memory[customer_phone] = []
        
        self.conversation_memory[customer_phone].append(f"Customer: {user_message}")
        self.conversation_memory[customer_phone].append(f"YarnMarket AI: {ai_response}")
        
        # Keep only last 10 exchanges
        if len(self.conversation_memory[customer_phone]) > 20:
            self.conversation_memory[customer_phone] = self.conversation_memory[customer_phone][-20:]
    
    def send_interactive_menu(self, phone: str, customer_name: str) -> bool:
        """
        Send interactive menu to customer
        """
        try:
            buttons = [
                {"id": "help", "title": "🤝 Get Help"},
                {"id": "products", "title": "🛍️ Browse Products"},
                {"id": "orders", "title": "📦 My Orders"}
            ]
            
            result = whatsapp_service.send_interactive_message(
                to=phone,
                header="YarnMarket AI",
                body=f"Hello {customer_name}! Welcome to YarnMarket! How can I help you today?",
                buttons=buttons
            )
            
            return result['success']
            
        except Exception as e:
            logger.error(f"Error sending interactive menu: {str(e)}")
            return False

# Initialize the handler
whatsapp_handler = WhatsAppConversationHandler()