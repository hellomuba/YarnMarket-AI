"""
YarnMarket AI Message Worker
Consumes messages from RabbitMQ and orchestrates conversation flow
"""

import os
import sys
import json
import logging
import asyncio
from typing import Optional

import aio_pika
import aiohttp
from aio_pika import connect_robust, IncomingMessage, ExchangeType

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Configuration
RABBITMQ_URL = os.getenv("RABBITMQ_URL", "amqp://yarnmarket:password@localhost:5672/")
CONVERSATION_ENGINE_URL = os.getenv(
    "CONVERSATION_ENGINE_URL",
    "http://localhost:8003"
)
INCOMING_QUEUE = "message_processing"  # Match webhook-handler queue name
OUTGOING_QUEUE = "outgoing_messages"


class MessageWorker:
    """Worker that processes messages from RabbitMQ"""

    def __init__(self):
        self.connection: Optional[aio_pika.Connection] = None
        self.channel: Optional[aio_pika.Channel] = None
        self.incoming_queue: Optional[aio_pika.Queue] = None
        self.outgoing_queue: Optional[aio_pika.Queue] = None
        self.http_session: Optional[aiohttp.ClientSession] = None

    async def connect(self):
        """Connect to RabbitMQ"""
        logger.info(f"Connecting to RabbitMQ at {RABBITMQ_URL}")

        try:
            self.connection = await connect_robust(RABBITMQ_URL)
            self.channel = await self.connection.channel()
            await self.channel.set_qos(prefetch_count=10)

            # Declare queues
            self.incoming_queue = await self.channel.declare_queue(
                INCOMING_QUEUE,
                durable=True
            )
            self.outgoing_queue = await self.channel.declare_queue(
                OUTGOING_QUEUE,
                durable=True
            )

            logger.info("✅ Connected to RabbitMQ successfully")

        except Exception as e:
            logger.error(f"❌ Failed to connect to RabbitMQ: {e}")
            raise

    async def disconnect(self):
        """Disconnect from RabbitMQ"""
        if self.connection:
            await self.connection.close()
            logger.info("Disconnected from RabbitMQ")

        if self.http_session:
            await self.http_session.close()

    async def process_incoming_message(self, message: IncomingMessage):
        """Process an incoming WhatsApp message"""
        async with message.process():
            try:
                # Parse message body
                body = json.loads(message.body.decode())
                logger.info(f"Processing message from {body.get('from')}: {body.get('content', '')[:50]}")

                # Prepare request for conversation engine
                # Build message object matching ConversationRequest schema
                message_obj = {
                    "id": body.get("message_id"),
                    "from": body.get("from"),
                    "timestamp": body.get("timestamp"),
                    "type": body.get("type", "text"),
                    "text": body.get("content", "")  # webhook sends 'content', conversation-engine expects 'text'
                }

                conversation_request = {
                    "merchant_id": body.get("merchant_id"),
                    "customer_phone": body.get("from"),
                    "message": message_obj
                }

                # Call conversation engine
                if not self.http_session:
                    self.http_session = aiohttp.ClientSession()

                async with self.http_session.post(
                    f"{CONVERSATION_ENGINE_URL}/conversation/process",
                    json=conversation_request,
                    timeout=aiohttp.ClientTimeout(total=30)
                ) as response:
                    if response.status == 200:
                        result = await response.json()
                        logger.info(f"✅ Conversation processed successfully: {result.get('message_id')}")

                        # Queue response for sending
                        if result.get("response_text"):
                            await self.queue_outgoing_message({
                                "to": body.get("from"),
                                "merchant_id": body.get("merchant_id"),
                                "text": result.get("response_text"),
                                "message_id": result.get("message_id")
                            })
                    else:
                        error_text = await response.text()
                        logger.error(f"❌ Conversation engine error ({response.status}): {error_text}")

            except json.JSONDecodeError as e:
                logger.error(f"Invalid JSON in message: {e}")
            except aiohttp.ClientError as e:
                logger.error(f"HTTP error calling conversation engine: {e}")
            except Exception as e:
                logger.error(f"Error processing message: {e}")

    async def queue_outgoing_message(self, message_data: dict):
        """Queue a message for sending via WhatsApp"""
        try:
            message_body = json.dumps(message_data).encode()
            await self.channel.default_exchange.publish(
                aio_pika.Message(
                    body=message_body,
                    delivery_mode=aio_pika.DeliveryMode.PERSISTENT
                ),
                routing_key=OUTGOING_QUEUE
            )
            logger.info(f"✅ Queued outgoing message to {message_data.get('to')}")
        except Exception as e:
            logger.error(f"Error queuing outgoing message: {e}")

    async def start_consuming(self):
        """Start consuming messages from the queue"""
        logger.info(f"🚀 Starting to consume messages from {INCOMING_QUEUE}")
        logger.info(f"📡 Conversation engine URL: {CONVERSATION_ENGINE_URL}")

        try:
            await self.incoming_queue.consume(self.process_incoming_message)
            logger.info("✅ Message worker is now consuming messages")

            # Keep the worker running
            await asyncio.Future()

        except KeyboardInterrupt:
            logger.info("Received shutdown signal")
        except Exception as e:
            logger.error(f"Error in message consumer: {e}")
            raise

    async def run(self):
        """Main run loop"""
        try:
            await self.connect()
            await self.start_consuming()
        except Exception as e:
            logger.error(f"Worker error: {e}")
        finally:
            await self.disconnect()


async def main():
    """Main entry point"""
    logger.info("=" * 60)
    logger.info("YarnMarket AI Message Worker")
    logger.info("=" * 60)

    worker = MessageWorker()

    try:
        await worker.run()
    except KeyboardInterrupt:
        logger.info("Shutting down gracefully...")
    except Exception as e:
        logger.error(f"Fatal error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
