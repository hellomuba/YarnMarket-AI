"""
Database connection and operations for YarnMarket AI
"""

import asyncio
import logging
from typing import Optional, List, Dict, Any
import asyncpg
import motor.motor_asyncio
from .config import Settings
from .models import CustomerProfile, MerchantSettings, Product

logger = logging.getLogger(__name__)


class Database:
    """Database connection manager for YarnMarket AI"""
    
    def __init__(self, database_url: str):
        self.database_url = database_url
        self.postgres_pool: Optional[asyncpg.Pool] = None
        self.mongodb_client: Optional[motor.motor_asyncio.AsyncIOMotorClient] = None
        self.mongodb_db = None
    
    async def connect(self):
        """Connect to all databases"""
        try:
            # PostgreSQL connection
            self.postgres_pool = await asyncpg.create_pool(
                self.database_url,
                min_size=5,
                max_size=20
            )
            
            # MongoDB connection (simplified for demo)
            # self.mongodb_client = motor.motor_asyncio.AsyncIOMotorClient("mongodb://localhost:27017")
            # self.mongodb_db = self.mongodb_client.yarnmarket
            
            logger.info("✅ Database connections established")
            
        except Exception as e:
            logger.error(f"❌ Database connection failed: {e}")
            raise
    
    async def disconnect(self):
        """Close database connections"""
        if self.postgres_pool:
            await self.postgres_pool.close()
        if self.mongodb_client:
            self.mongodb_client.close()
        logger.info("Database connections closed")
    
    async def get_merchant(self, merchant_id: str) -> MerchantSettings:
        """Get merchant settings"""
        # For demo, return default merchant
        return MerchantSettings(
            merchant_id=merchant_id,
            business_name="Demo Business",
            business_type="retail",
            phone_number="+234XXXXXXXX",
            min_discount_percentage=5.0,
            max_discount_percentage=20.0,
            negotiation_enabled=True
        )
    
    async def get_customer(self, phone_number: str) -> Optional[CustomerProfile]:
        """Get customer profile"""
        # For demo, return basic profile
        return CustomerProfile(
            phone_number=phone_number,
            name=f"Customer {phone_number[-4:]}",
            preferred_language="pidgin"
        )
    
    async def create_customer(self, customer: CustomerProfile):
        """Create new customer profile"""
        logger.info(f"Creating customer profile for {customer.phone_number}")
        return customer
    
    async def get_products(
        self, 
        merchant_id: str,
        category: Optional[str] = None,
        max_price: Optional[float] = None,
        search_terms: Optional[List[str]] = None
    ) -> List[Product]:
        """Get products for merchant"""
        # Demo products
        products = [
            Product(
                id="1",
                name="Cotton Shirt",
                description="High quality cotton shirt",
                price=15000.0,
                category="clothing",
                merchant_id=merchant_id
            ),
            Product(
                id="2", 
                name="Jeans",
                description="Durable denim jeans",
                price=25000.0,
                category="clothing",
                merchant_id=merchant_id
            ),
            Product(
                id="3",
                name="Sneakers",
                description="Comfortable running shoes",
                price=35000.0,
                category="footwear", 
                merchant_id=merchant_id
            )
        ]
        
        # Simple filtering
        if max_price:
            products = [p for p in products if p.price <= max_price]
            
        return products
    
    async def get_product(self, product_id: str) -> Optional[Product]:
        """Get single product"""
        products = await self.get_products("demo")
        for product in products:
            if product.id == product_id:
                return product
        return None
    
    async def create_order(
        self,
        merchant_id: str,
        customer_phone: str, 
        products: List[Product],
        quantity: int,
        total_amount: float
    ) -> str:
        """Create new order"""
        order_id = f"order_{len(products)}_{quantity}"
        logger.info(f"Created order {order_id} for {customer_phone}")
        return order_id
    
    async def get_conversation_history(
        self,
        customer_phone: str,
        merchant_id: str,
        limit: int = 20
    ) -> List[Dict[str, Any]]:
        """Get conversation history"""
        # Demo conversation history
        return [
            {
                "customer_message": "Hello!",
                "ai_response": "Good day! How can I help you?",
                "timestamp": "2024-01-01T10:00:00Z",
                "language": "english"
            }
        ]
    
    async def store_conversation(self, conversation_data: Dict[str, Any]):
        """Store conversation data"""
        logger.info(f"Storing conversation for {conversation_data.get('customer_phone')}")
        return True