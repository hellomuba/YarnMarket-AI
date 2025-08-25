"""
YarnMarket AI Analytics Service
Provides business intelligence and conversation analytics
"""

import logging
from datetime import datetime
from typing import Dict, Any

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="YarnMarket AI Analytics Service",
    description="Business intelligence and conversation analytics",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "yarnmarket-analytics-service",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "1.0.0"
    }

@app.get("/metrics")
async def get_metrics():
    """Get analytics metrics"""
    return {
        "active_conversations": 247,
        "total_revenue": 850000,
        "conversion_rate": 68.5,
        "avg_response_time": 285,
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/conversation-analytics")
async def get_conversation_analytics():
    """Get conversation analytics data"""
    return {
        "total_conversations": 1250,
        "successful_negotiations": 856,
        "language_distribution": {
            "pidgin": 45,
            "english": 35, 
            "yoruba": 12,
            "igbo": 5,
            "hausa": 3
        },
        "conversation_types": {
            "product_inquiry": 156,
            "price_negotiation": 89,
            "order_creation": 67,
            "general_chat": 45,
            "complaints": 12
        },
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/merchant/{merchant_id}/analytics")
async def get_merchant_analytics(merchant_id: str):
    """Get analytics for specific merchant"""
    return {
        "merchant_id": merchant_id,
        "active_conversations": 42,
        "daily_revenue": 125000,
        "conversion_rate": 72.3,
        "customer_satisfaction": 4.2,
        "top_products": [
            {"name": "Cotton Shirt", "sales": 15},
            {"name": "Jeans", "sales": 12},
            {"name": "Sneakers", "sales": 8}
        ],
        "timestamp": datetime.utcnow().isoformat()
    }

if __name__ == "__main__":
    import uvicorn
    logger.info("🚀 Starting YarnMarket Analytics Service...")
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8002,
        reload=True,
        log_level="info"
    )