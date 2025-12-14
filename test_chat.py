#!/usr/bin/env python3
"""
YarnMarket AI Chat Service Tester
Simple script to demonstrate and test the OpenAI-powered chat functionality
"""

import os
import asyncio
import sys
import json
from typing import Dict, Any
from datetime import datetime

# Add the conversation engine to the path
sys.path.append('./services/conversation-engine')

from openai import AsyncOpenAI


class YarnMarketChatTester:
    """Simple tester for the YarnMarket AI chat functionality"""
    
    def __init__(self, openai_api_key: str):
        self.openai_client = AsyncOpenAI(api_key=openai_api_key)
        
        # Nigerian market greeting templates
        self.greeting_templates = {
            "pidgin": [
                "Good morning o! How you dey today? Wetin you wan buy?",
                "Afternoon my customer! Welcome to our shop. How we fit help you?",
                "Evening sir/madam! You still dey work hard o. Wetin bring you come?"
            ],
            "english": [
                "Good morning! Welcome to our store. How can I help you today?",
                "Good afternoon! Thank you for visiting us. What can I show you?",
                "Good evening! How may I assist you today?"
            ]
        }
    
    async def generate_response(
        self, 
        customer_message: str,
        language: str = "pidgin",
        business_type: str = "fabric and textile",
        personality: Dict[str, float] = None
    ) -> str:
        """Generate culturally appropriate Nigerian market response"""
        
        if personality is None:
            personality = {"friendliness": 0.8, "humor": 0.6, "patience": 0.7}
        
        # Determine language setting
        language_setting = "Nigerian Pidgin English" if language == "pidgin" else "English"
        
        # Build personality context
        personality_desc = []
        if personality.get("friendliness", 0.5) > 0.7:
            personality_desc.append("very friendly and warm")
        if personality.get("humor", 0.5) > 0.6:
            personality_desc.append("uses gentle humor")
        if personality.get("patience", 0.5) > 0.7:
            personality_desc.append("very patient and understanding")
        
        personality_context = ", ".join(personality_desc) if personality_desc else "professional and helpful"
        
        system_prompt = f"""You are a Nigerian market vendor assistant for a {business_type} business. 
        You should respond in {language_setting} with authentic Nigerian market conversation style.
        Your personality is {personality_context}.
        Keep responses concise (1-2 sentences), culturally authentic, and helpful.
        Use appropriate Nigerian expressions and market vendor communication style.
        Always maintain a helpful, business-focused tone while being conversational.
        
        For greetings, be warm and welcoming.
        For product inquiries, be enthusiastic and show good products.
        For price negotiations, be fair but protect your business.
        For complaints, be empathetic and solution-focused."""

        try:
            response = await self.openai_client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": customer_message}
                ],
                max_tokens=150,
                temperature=0.8,
                presence_penalty=0.1,
                frequency_penalty=0.1
            )
            
            generated_text = response.choices[0].message.content.strip()
            
            # Clean up response
            if generated_text:
                generated_text = generated_text.strip('"\'')
                if generated_text and not generated_text[-1] in '.!?':
                    generated_text += '!'
                return generated_text
            else:
                return "Sorry, I no fit understand you well. Fit you talk again?"
                
        except Exception as e:
            print(f"OpenAI API error: {str(e)}")
            # Fallback to template response
            if "good morning" in customer_message.lower() or "morning" in customer_message.lower():
                return "Good morning o! Welcome to our shop. How we fit help you today?"
            elif "good afternoon" in customer_message.lower() or "afternoon" in customer_message.lower():
                return "Afternoon my customer! Wetin you dey look for?"
            elif "good evening" in customer_message.lower() or "evening" in customer_message.lower():
                return "Evening! You still get energy to shop o! Wetin you need?"
            else:
                return "Welcome to our shop! How we fit help you today?"


async def run_chat_tests():
    """Run various chat scenarios to test the system"""
    
    # Get OpenAI API key from environment
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        print("ERROR: OpenAI API key not found in environment variables!")
        print("Please set OPENAI_API_KEY environment variable or update the .env file")
        return
    
    print("Starting YarnMarket AI Chat Service Tests...")
    print("=" * 60)
    
    # Initialize tester
    tester = YarnMarketChatTester(api_key)
    
    # Test scenarios
    test_scenarios = [
        {
            "name": "Morning Greeting (Pidgin)",
            "message": "Good morning! I wan buy some fabric",
            "language": "pidgin",
            "business_type": "fabric and textile"
        },
        {
            "name": "Product Inquiry (English)",
            "message": "What kinds of fabric do you have available?",
            "language": "english",
            "business_type": "fabric and textile"
        },
        {
            "name": "Price Negotiation (Pidgin)",
            "message": "This fabric too cost o! You fit reduce the price small?",
            "language": "pidgin",
            "business_type": "fabric and textile",
            "personality": {"friendliness": 0.9, "humor": 0.7, "patience": 0.8}
        },
        {
            "name": "Order Inquiry (English)",
            "message": "I want to order 5 yards of the blue fabric. How much will that cost?",
            "language": "english",
            "business_type": "fabric and textile"
        },
        {
            "name": "Complaint (Pidgin)",
            "message": "The fabric wey I buy yesterday don tear already! I no happy at all!",
            "language": "pidgin",
            "business_type": "fabric and textile",
            "personality": {"friendliness": 0.9, "humor": 0.3, "patience": 0.9}
        },
        {
            "name": "General Chat (English)",
            "message": "What time do you close on Saturdays?",
            "language": "english",
            "business_type": "fabric and textile"
        }
    ]
    
    # Run tests
    for i, scenario in enumerate(test_scenarios, 1):
        print(f"\nTest {i}: {scenario['name']}")
        print(f"Customer: {scenario['message']}")
        print("AI Response: ", end="")
        
        try:
            response = await tester.generate_response(
                customer_message=scenario['message'],
                language=scenario.get('language', 'pidgin'),
                business_type=scenario.get('business_type', 'fabric and textile'),
                personality=scenario.get('personality')
            )
            print(f"{response}")
            print("PASS: Test passed!")
            
        except Exception as e:
            print(f"FAIL: Test failed: {str(e)}")
        
        # Add a small delay between tests
        await asyncio.sleep(1)
    
    print("\n" + "=" * 60)
    print("Chat service testing completed!")
    print("\nHow to test further:")
    print("1. Run this script: python test_chat.py")
    print("2. Test WhatsApp webhook: curl -X POST http://localhost:8082/webhook")
    print("3. Use the conversation API directly once database is fixed")
    print("4. Check service logs: docker-compose logs conversation-engine")


if __name__ == "__main__":
    # Load environment variables
    from dotenv import load_dotenv
    load_dotenv()
    
    # Run the tests
    asyncio.run(run_chat_tests())