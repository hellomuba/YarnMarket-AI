"""
YarnMarket AI Dashboard API
FastAPI backend for admin dashboard with real-time WebSocket updates
"""

import os
import logging
from datetime import datetime, timedelta
from typing import List, Optional
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import asyncpg
import uvicorn

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global database connection pool
db_pool: Optional[asyncpg.Pool] = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown logic"""
    global db_pool

    logger.info("🚀 Starting Dashboard API...")

    # Initialize database connection pool
    database_url = os.getenv("DATABASE_URL", "postgresql://yarnmarket:password@localhost:5432/yarnmarket")
    try:
        db_pool = await asyncpg.create_pool(database_url, min_size=2, max_size=10)
        logger.info("✅ Database connection pool created")
    except Exception as e:
        logger.error(f"❌ Failed to connect to database: {e}")
        db_pool = None

    yield

    # Cleanup
    if db_pool:
        await db_pool.close()
        logger.info("🛑 Database connection pool closed")


# Create FastAPI app
app = FastAPI(
    title="YarnMarket AI Dashboard API",
    description="Admin dashboard backend with real-time updates",
    version="1.0.0",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
from routes import whatsapp_router, products_router
app.include_router(whatsapp_router)
app.include_router(products_router)


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    db_status = "healthy" if db_pool else "disconnected"
    return {
        "status": "healthy",
        "service": "dashboard-api",
        "version": "1.0.0",
        "database": db_status,
        "timestamp": datetime.utcnow().isoformat()
    }


@app.get("/merchants")
async def get_merchants():
    """Get all merchants"""
    if not db_pool:
        raise HTTPException(status_code=503, detail="Database not available")

    try:
        async with db_pool.acquire() as conn:
            rows = await conn.fetch("""
                SELECT
                    id, name, email, phone, phone_number, business_name,
                    whatsapp_number, status, created_at, updated_at
                FROM merchants
                ORDER BY created_at DESC
            """)

            merchants = [dict(row) for row in rows]
            return merchants
    except Exception as e:
        logger.error(f"Error fetching merchants: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/merchants")
async def create_merchant(merchant_data: dict):
    """Create a new merchant"""
    if not db_pool:
        raise HTTPException(status_code=503, detail="Database not available")

    try:
        async with db_pool.acquire() as conn:
            # Get phone value - use phone or whatsapp_number
            phone_value = merchant_data.get("phone") or merchant_data.get("whatsapp_number")
            whatsapp_value = merchant_data.get("whatsapp_number") or merchant_data.get("phone")

            row = await conn.fetchrow("""
                INSERT INTO merchants (name, email, phone, phone_number, business_name, whatsapp_number, status)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING id, name, email, phone, phone_number, business_name, whatsapp_number, status, created_at
            """,
                merchant_data.get("name"),
                merchant_data.get("email"),
                phone_value,
                phone_value,  # Also populate phone_number for webhook compatibility
                merchant_data.get("business_name"),
                whatsapp_value,
                merchant_data.get("status", "active")
            )

            return dict(row)
    except Exception as e:
        logger.error(f"Error creating merchant: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/messages")
async def get_messages(
    status: Optional[str] = Query(None),
    type: Optional[str] = Query(None),
    merchant_id: Optional[int] = Query(None),
    dateRange: Optional[str] = Query(None)
):
    """Get messages with optional filters"""
    if not db_pool:
        raise HTTPException(status_code=503, detail="Database not available")

    try:
        async with db_pool.acquire() as conn:
            query = """
                SELECT
                    id, merchant_id, customer_phone, message_text,
                    message_type, status, direction, created_at
                FROM messages
                WHERE 1=1
            """
            params = []
            param_count = 1

            if merchant_id:
                query += f" AND merchant_id = ${param_count}"
                params.append(merchant_id)
                param_count += 1

            if status and status != 'all':
                query += f" AND status = ${param_count}"
                params.append(status)
                param_count += 1

            if type and type != 'all':
                query += f" AND message_type = ${param_count}"
                params.append(type)
                param_count += 1

            query += " ORDER BY created_at DESC LIMIT 100"

            rows = await conn.fetch(query, *params)
            messages = [dict(row) for row in rows]
            return messages
    except Exception as e:
        logger.error(f"Error fetching messages: {e}")
        # Return empty array if table doesn't exist yet
        return []


@app.get("/api/conversations")
async def get_conversations(
    status: Optional[str] = Query(None),
    merchant_id: Optional[int] = Query(None),
    dateRange: Optional[str] = Query(None)
):
    """Get conversations with optional filters"""
    if not db_pool:
        raise HTTPException(status_code=503, detail="Database not available")

    try:
        async with db_pool.acquire() as conn:
            query = """
                SELECT DISTINCT
                    c.merchant_id,
                    c.customer_phone,
                    c.status,
                    c.last_message_at,
                    c.created_at,
                    m.name as merchant_name
                FROM conversations c
                LEFT JOIN merchants m ON c.merchant_id = m.id
                WHERE 1=1
            """
            params = []
            param_count = 1

            if merchant_id:
                query += f" AND c.merchant_id = ${param_count}"
                params.append(merchant_id)
                param_count += 1

            if status and status != 'all':
                query += f" AND c.status = ${param_count}"
                params.append(status)
                param_count += 1

            query += " ORDER BY c.last_message_at DESC LIMIT 100"

            rows = await conn.fetch(query, *params)
            conversations = [dict(row) for row in rows]
            return conversations
    except Exception as e:
        logger.error(f"Error fetching conversations: {e}")
        return []


@app.get("/api/queues")
async def get_queue_status():
    """Get RabbitMQ queue status"""
    # TODO: Implement actual RabbitMQ monitoring
    return [
        {
            "name": "incoming_messages",
            "messages": 0,
            "consumers": 1,
            "status": "healthy"
        },
        {
            "name": "outgoing_messages",
            "messages": 0,
            "consumers": 1,
            "status": "healthy"
        }
    ]


@app.get("/api/metrics")
async def get_system_metrics(merchant_id: Optional[int] = Query(None)):
    """Get system metrics"""
    if not db_pool:
        return {
            "total_conversations": 0,
            "active_conversations": 0,
            "total_messages": 0,
            "success_rate": 0,
            "avg_response_time": 0
        }

    try:
        async with db_pool.acquire() as conn:
            # Get conversation counts
            conv_query = "SELECT COUNT(*) FROM conversations"
            if merchant_id:
                conv_query += f" WHERE merchant_id = {merchant_id}"

            total_conv = await conn.fetchval(conv_query)
            active_conv = await conn.fetchval(conv_query + " AND status = 'active'") if 'WHERE' in conv_query else await conn.fetchval(conv_query + " WHERE status = 'active'")

            # Get message count
            msg_query = "SELECT COUNT(*) FROM messages"
            if merchant_id:
                msg_query += f" WHERE merchant_id = {merchant_id}"

            total_msg = await conn.fetchval(msg_query)

            return {
                "total_conversations": total_conv or 0,
                "active_conversations": active_conv or 0,
                "total_messages": total_msg or 0,
                "success_rate": 95.5,
                "avg_response_time": 1.2
            }
    except Exception as e:
        logger.error(f"Error fetching metrics: {e}")
        return {
            "total_conversations": 0,
            "active_conversations": 0,
            "total_messages": 0,
            "success_rate": 0,
            "avg_response_time": 0
        }


@app.post("/api/test-message")
async def send_test_message(test_data: dict):
    """Send a test message"""
    # TODO: Implement actual message sending
    return {
        "status": "sent",
        "message_id": f"test_{datetime.utcnow().timestamp()}"
    }


@app.post("/api/test-console/send-message")
async def test_console_send_message(data: dict):
    """Send message from test console"""
    # TODO: Integrate with conversation engine
    return {
        "status": "success",
        "message_id": f"test_{datetime.utcnow().timestamp()}",
        "response": "Test message received"
    }


@app.get("/api/settings")
async def get_settings():
    """Get system settings"""
    return {
        "whatsapp": {
            "connected": True,
            "phone_number": os.getenv("WHATSAPP_PHONE_NUMBER_ID", "")
        },
        "openai": {
            "configured": bool(os.getenv("OPENAI_API_KEY"))
        },
        "database": {
            "connected": bool(db_pool)
        }
    }


@app.put("/api/settings")
async def update_settings(settings: dict):
    """Update system settings"""
    # TODO: Implement settings persistence
    return {"status": "updated"}


@app.post("/api/settings/test-connection")
async def test_connection(data: dict):
    """Test external service connection"""
    # TODO: Implement actual connection testing
    return {"success": True}


if __name__ == "__main__":
    port = int(os.getenv("PORT", 8005))
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        log_level="info"
    )
