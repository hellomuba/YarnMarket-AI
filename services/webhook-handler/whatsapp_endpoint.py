"""
WhatsApp API Endpoint for YarnMarket AI
Handles WhatsApp webhook integration with the conversation engine
"""

from fastapi import FastAPI, Request, HTTPException, BackgroundTasks
from fastapi.responses import PlainTextResponse, JSONResponse
from pydantic import BaseModel
from typing import Dict, List, Optional, Any
import os
import logging
import asyncio
import json
from datetime import datetime
import requests
import openai

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
WHATSAPP_ACCESS_TOKEN = os.getenv('WHATSAPP_ACCESS_TOKEN')
WHATSAPP_PHONE_NUMBER_ID = os.getenv('WHATSAPP_PHONE_NUMBER_ID')
WHATSAPP_VERIFY_TOKEN = os.getenv('WHATSAPP_VERIFY_TOKEN', 'yarnmarket_verify_2024')
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')

# Initialize OpenAI if available
if OPENAI_API_KEY:
    openai.api_key = OPENAI_API_KEY

app = FastAPI(title="YarnMarket AI WhatsApp API", version="1.0.0")

class WhatsAppWebhookData(BaseModel):
    object: str
    entry: List[Dict[str, Any]]

class WhatsAppService:
    """WhatsApp Business API Service"""
    
    def __init__(self):
        self.base_url = f"https://graph.facebook.com/v22.0/{WHATSAPP_PHONE_NUMBER_ID}"
        self.headers = {
            'Authorization': f'Bearer {WHATSAPP_ACCESS_TOKEN}',
            'Content-Type': 'application/json'
        }
    
    async def send_message(self, phone: str, message: str) -> Dict:
        """Send WhatsApp message"""
        try:
            payload = {
                "messaging_product": "whatsapp",
                "to": phone,
                "type": "text",
                "text": {"body": message}
            }
            
            response = requests.post(
                f"{self.base_url}/messages",
                headers=self.headers,
                json=payload
            )
            
            if response.status_code == 200:
                result = response.json()
                logger.info(f"Message sent to {phone}: {result}")
                return {"success": True, "data": result}
            else:
                error = response.json()
                logger.error(f"Failed to send message: {error}")
                return {"success": False, "error": error}
                
        except Exception as e:
            logger.error(f"Error sending message: {str(e)}")
            return {"success": False, "error": str(e)}
    
    async def send_interactive_message(self, phone: str, header: str, body: str, buttons: List[Dict]) -> Dict:
        """Send interactive button message"""
        try:
            interactive_buttons = []
            for i, button in enumerate(buttons):
                interactive_buttons.append({
                    "type": "reply",
                    "reply": {
                        "id": button.get('id', f"btn_{i}"),
                        "title": button.get('title', f"Option {i+1}")
                    }
                })
            
            payload = {
                "messaging_product": "whatsapp",
                "to": phone,
                "type": "interactive",
                "interactive": {
                    "type": "button",
                    "header": {"type": "text", "text": header},
                    "body": {"text": body},
                    "action": {"buttons": interactive_buttons}
                }
            }
            
            response = requests.post(
                f"{self.base_url}/messages",
                headers=self.headers,
                json=payload
            )
            
            if response.status_code == 200:
                return {"success": True, "data": response.json()}
            else:
                return {"success": False, "error": response.json()}
                
        except Exception as e:
            logger.error(f"Error sending interactive message: {str(e)}")
            return {"success": False, "error": str(e)}

class YarnMarketAI:
    """YarnMarket AI Conversation Handler"""
    
    def __init__(self):
        self.conversation_memory = {}
        self.whatsapp = WhatsAppService()
    
    async def generate_ai_response(self, message: str, customer_name: str, phone: str) -> str:
        """Generate intelligent AI response"""
        try:
            # Get conversation context
            context = self.get_conversation_context(phone)
            
            # Use OpenAI if available
            if OPENAI_API_KEY:
                return await self.generate_openai_response(message, customer_name, context)
            
            # Fallback to rule-based
            return self.generate_rule_based_response(message, customer_name)
            
        except Exception as e:
            logger.error(f"Error generating AI response: {str(e)}")
            return f"Hello {customer_name}! Thanks for your message. I'm here to help with your YarnMarket shopping needs! 🛍️"
    
    async def generate_openai_response(self, message: str, customer_name: str, context: List[str]) -> str:
        """Generate response using OpenAI GPT"""
        try:
            context_text = "\n".join(context[-5:]) if context else ""
            
            system_prompt = f"""You are YarnMarket AI, a friendly Nigerian e-commerce shopping assistant.

Customer: {customer_name}
Platform: YarnMarket - Nigerian online marketplace

Your personality:
- Friendly, helpful, and culturally aware
- Use appropriate Nigerian English expressions
- Professional but warm tone
- Always eager to help with shopping

Your expertise:
- Product recommendations and search
- Price checking and comparisons  
- Order tracking and support
- Shopping advice and trends

Guidelines:
- Keep responses under 200 characters when possible
- Use relevant emojis (🛍️, 💰, 📦, 🎯, etc.)
- Ask follow-up questions to help better
- Be enthusiastic about helping

Previous conversation:
{context_text}

Customer message: "{message}"

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
            self.update_conversation_memory(phone, message, ai_response)
            
            return ai_response
            
        except Exception as e:
            logger.error(f"OpenAI error: {str(e)}")
            return self.generate_rule_based_response(message, customer_name)
    
    def generate_rule_based_response(self, message: str, customer_name: str) -> str:
        """Enhanced rule-based responses"""
        msg = message.lower()
        
        # Product categories mapping
        categories = {
            'electronics': ['phone', 'laptop', 'computer', 'electronics', 'gadget', 'tech'],
            'fashion': ['clothes', 'dress', 'shirt', 'fashion', 'wear', 'style'],
            'home': ['home', 'kitchen', 'furniture', 'decor', 'household'],
            'beauty': ['beauty', 'cosmetics', 'skincare', 'makeup', 'care'],
            'sports': ['sports', 'fitness', 'exercise', 'gym', 'workout']
        }
        
        # Detect category interest
        detected_category = None
        for category, keywords in categories.items():
            if any(keyword in msg for keyword in keywords):
                detected_category = category
                break
        
        # Generate contextual responses
        if any(word in msg for word in ['hello', 'hi', 'hey', 'morning', 'evening']):
            return f"Hello {customer_name}! 👋 Welcome to YarnMarket AI!\n\nI'm your personal shopping assistant ready to help with:\n🛍️ Product discovery\n💰 Best prices\n📦 Order tracking\n🎯 Smart recommendations\n\nWhat can I find for you today?"
        
        elif any(word in msg for word in ['help', 'assist', 'support']):
            return f"I'm here to help, {customer_name}! 🤝\n\n🔥 **WHAT I CAN DO:**\n• Find any product you need\n• Compare prices across options\n• Track your orders real-time\n• Recommend trending items\n• Answer shopping questions\n\nWhat would you like help with?"
        
        elif detected_category:
            category_responses = {
                'electronics': f"Tech enthusiast! 📱 {customer_name}, you're in the right place!\n\n⚡ **TRENDING TECH:**\n• Latest smartphones & accessories\n• Laptops & tablets\n• Gaming gear\n• Smart home devices\n\n🎯 What tech item interests you?",
                'fashion': f"Style icon! 👗 {customer_name}, let's find your perfect look!\n\n✨ **FASHION HIGHLIGHTS:**\n• Latest collections\n• Seasonal trends\n• Accessories & jewelry\n• Footwear styles\n\n💫 What style are you after?",
                'home': f"Home decorator! 🏠 {customer_name}, let's beautify your space!\n\n🌟 **HOME ESSENTIALS:**\n• Kitchen appliances\n• Furniture & decor\n• Storage solutions\n• Home comfort items\n\n🎨 What's your home project?",
                'beauty': f"Beauty lover! 💄 {customer_name}, let's enhance your glow!\n\n✨ **BEAUTY FAVORITES:**\n• Skincare essentials\n• Makeup collections\n• Hair care products\n• Fragrance selection\n\n🌟 What beauty goal are we achieving?",
                'sports': f"Fitness champion! 💪 {customer_name}, let's gear up!\n\n🏃‍♀️ **FITNESS ESSENTIALS:**\n• Workout equipment\n• Sportswear & shoes\n• Fitness accessories\n• Health supplements\n\n🎯 What's your fitness focus?"
            }
            return category_responses.get(detected_category, f"Great choice, {customer_name}! Let me help you find the perfect {detected_category} products! 🛍️")
        
        elif any(word in msg for word in ['price', 'cost', 'naira', '₦', 'how much']):
            return f"Smart shopper! 💰 {customer_name}, I love helping find great deals!\n\n🔍 **FOR ACCURATE PRICING:**\nTell me the specific product you're interested in.\n\n✅ **I'LL PROVIDE:**\n• Current best prices\n• Available discounts\n• Price comparisons\n• Budget alternatives\n\nWhat product shall I price for you?"
        
        elif any(word in msg for word in ['order', 'track', 'delivery', 'shipping']):
            return f"Order tracking time! 📦 {customer_name}, let me check that for you!\n\n🔍 **TO TRACK YOUR ORDER:**\nPlease share your order number (format: YM123456)\n\n📱 **TRACKING INFO INCLUDES:**\n• Real-time status updates\n• Estimated delivery time\n• Delivery location\n• Contact info\n\nWhat's your order number?"
        
        elif any(word in msg for word in ['thank', 'thanks', 'appreciate']):
            return f"You're very welcome, {customer_name}! 😊 Making your shopping experience amazing is what I live for!\n\nAnything else you'd like to explore? I'm always here to help! ✨🛍️"
        
        else:
            return f"Interesting, {customer_name}! 🤔 I see you mentioned: \"{message[:50]}{'...' if len(message) > 50 else ''}\"\n\nAs your YarnMarket AI assistant, I'm ready to help! Whether it's finding products, checking prices, or tracking orders - I've got you covered!\n\nWhat can I help you discover today? 🎯"
    
    def get_conversation_context(self, phone: str) -> List[str]:
        """Get conversation context"""
        return self.conversation_memory.get(phone, [])
    
    def update_conversation_memory(self, phone: str, user_message: str, ai_response: str):
        """Update conversation memory"""
        if phone not in self.conversation_memory:
            self.conversation_memory[phone] = []
        
        self.conversation_memory[phone].append(f"Customer: {user_message}")
        self.conversation_memory[phone].append(f"YarnMarket AI: {ai_response}")
        
        # Keep last 10 exchanges
        if len(self.conversation_memory[phone]) > 20:
            self.conversation_memory[phone] = self.conversation_memory[phone][-20:]
    
    async def process_message(self, message_data: Dict) -> bool:
        """Process incoming WhatsApp message"""
        try:
            phone = message_data.get('from')
            customer_name = message_data.get('customer_name', 'Customer')
            message_text = message_data.get('text', '')
            message_type = message_data.get('type', 'text')
            
            logger.info(f"Processing message from {customer_name} ({phone}): {message_text}")
            
            if message_type == 'text' and message_text:
                # Generate AI response
                response = await self.generate_ai_response(message_text, customer_name, phone)
                
                # Send response
                result = await self.whatsapp.send_message(phone, response)
                
                if result['success']:
                    logger.info(f"Response sent successfully to {phone}")
                    return True
                else:
                    logger.error(f"Failed to send response: {result['error']}")
                    return False
            
            else:
                # Handle non-text messages
                response = f"Hello {customer_name}! I received your {message_type} message. How can I help you with your shopping today? 🛍️"
                result = await self.whatsapp.send_message(phone, response)
                return result['success']
                
        except Exception as e:
            logger.error(f"Error processing message: {str(e)}")
            return False

# Initialize AI handler
yarnmarket_ai = YarnMarketAI()

@app.get("/")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "YarnMarket AI WhatsApp API",
        "timestamp": datetime.utcnow().isoformat(),
        "features": {
            "whatsapp_integration": bool(WHATSAPP_ACCESS_TOKEN),
            "openai_integration": bool(OPENAI_API_KEY)
        }
    }

@app.get("/webhook")
async def webhook_verification(request: Request):
    """WhatsApp webhook verification"""
    try:
        mode = request.query_params.get("hub.mode")
        token = request.query_params.get("hub.verify_token")
        challenge = request.query_params.get("hub.challenge")
        
        logger.info(f"Webhook verification: mode={mode}, token={token}")
        
        if mode == "subscribe" and token == WHATSAPP_VERIFY_TOKEN:
            logger.info("Webhook verified successfully")
            return PlainTextResponse(challenge)
        else:
            logger.warning("Webhook verification failed")
            raise HTTPException(status_code=403, detail="Forbidden")
            
    except Exception as e:
        logger.error(f"Webhook verification error: {str(e)}")
        raise HTTPException(status_code=400, detail="Bad Request")

@app.post("/webhook")
async def webhook_handler(webhook_data: WhatsAppWebhookData, background_tasks: BackgroundTasks):
    """Handle incoming WhatsApp messages"""
    try:
        logger.info(f"Webhook received: {webhook_data.dict()}")
        
        if webhook_data.object != "whatsapp_business_account":
            return JSONResponse({"status": "ignored"})
        
        processed_messages = 0
        
        for entry in webhook_data.entry:
            for change in entry.get("changes", []):
                if change.get("field") != "messages":
                    continue
                
                value = change.get("value", {})
                messages = value.get("messages", [])
                contacts = value.get("contacts", [])
                
                for message in messages:
                    # Find contact info
                    contact = next(
                        (c for c in contacts if c.get("wa_id") == message.get("from")),
                        {}
                    )
                    
                    message_data = {
                        "id": message.get("id"),
                        "from": message.get("from"),
                        "type": message.get("type"),
                        "text": message.get("text", {}).get("body", ""),
                        "customer_name": contact.get("profile", {}).get("name", "Customer"),
                        "timestamp": datetime.fromtimestamp(int(message.get("timestamp", 0)))
                    }
                    
                    # Process message in background
                    background_tasks.add_task(yarnmarket_ai.process_message, message_data)
                    processed_messages += 1
        
        return JSONResponse({
            "status": "success",
            "processed_messages": processed_messages,
            "timestamp": datetime.utcnow().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Webhook handler error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

@app.post("/send-message")
async def send_message_endpoint(
    phone: str,
    message: str,
    customer_name: str = "Customer"
):
    """Manual message sending endpoint"""
    try:
        result = await yarnmarket_ai.whatsapp.send_message(phone, message)
        return result
    except Exception as e:
        logger.error(f"Send message error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)