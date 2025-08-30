#!/usr/bin/env python3
"""
Message Processor - Consumes WhatsApp messages from RabbitMQ and processes them
"""

import asyncio
import json
import logging
import aio_pika
import aiohttp
from datetime import datetime
from typing import Dict, Any

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class MessageProcessor:
    def __init__(self):
        self.rabbitmq_url = "amqp://yarnmarket:rabbit_test_2024@localhost:5672/"
        self.conversation_engine_url = "http://localhost:8003"
        
    async def connect_rabbitmq(self):
        """Connect to RabbitMQ"""
        try:
            self.connection = await aio_pika.connect_robust(self.rabbitmq_url)
            self.channel = await self.connection.channel()
            self.queue = await self.channel.declare_queue("message_processing", durable=True)
            logger.info("✅ Connected to RabbitMQ")
        except Exception as e:
            logger.error(f"❌ Failed to connect to RabbitMQ: {e}")
            raise
    
    async def process_message(self, message: aio_pika.IncomingMessage):
        """Process a single WhatsApp message"""
        try:
            # Parse message body
            body = json.loads(message.body.decode())
            logger.info(f"📨 Processing message: {body}")
            
            # Extract WhatsApp message data
            customer_phone = body.get('from', '')
            message_text = body.get('content', '')
            message_type = body.get('type', 'text')
            message_id = body.get('message_id', '')
            timestamp = body.get('timestamp', '')
            
            # Create WhatsApp message object
            whatsapp_message = {
                "id": message_id,
                "from": customer_phone,
                "timestamp": timestamp,
                "type": message_type,
                "text": message_text if message_type == "text" else None
            }
            
            # Create conversation request
            conversation_request = {
                "message": whatsapp_message,
                "merchant_id": body.get('merchant_id', 'default_merchant'),
                "customer_phone": customer_phone,
                "conversation_history": []
            }
            
            # Send to conversation engine
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{self.conversation_engine_url}/conversation/process",
                    json=conversation_request,
                    headers={"Content-Type": "application/json"}
                ) as response:
                    if response.status == 200:
                        result = await response.json()
                        logger.info(f"✅ Conversation processed: {result}")
                        
                        # TODO: Send response back to WhatsApp
                        # This would call WhatsApp Business API to send the AI response
                        await self.send_whatsapp_response(
                            customer_phone, 
                            result.get('response_text', 'Hello! How can I help you?')
                        )
                        
                    else:
                        logger.error(f"❌ Conversation engine error: {response.status}")
            
            # Acknowledge message processing
            await message.ack()
            
        except Exception as e:
            logger.error(f"❌ Error processing message: {e}")
            await message.nack(requeue=False)
    
    async def send_whatsapp_response(self, to_phone: str, text: str):
        """Send response back to WhatsApp (placeholder for now)"""
        logger.info(f"📤 Would send to {to_phone}: {text}")
        # TODO: Implement actual WhatsApp Business API call
        # This should use the WhatsApp Business API to send the response
    
    async def start_consuming(self):
        """Start consuming messages from RabbitMQ"""
        logger.info("🚀 Starting message processor...")
        
        await self.connect_rabbitmq()
        
        # Start consuming
        await self.queue.consume(self.process_message)
        logger.info("👂 Listening for messages...")
        
        try:
            # Wait forever
            await asyncio.Future()
        except KeyboardInterrupt:
            logger.info("🛑 Stopping message processor...")
        finally:
            await self.connection.close()

async def main():
    processor = MessageProcessor()
    await processor.start_consuming()

if __name__ == "__main__":
    asyncio.run(main())