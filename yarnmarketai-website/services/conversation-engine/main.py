"""
YarnMarket AI Conversation Engine
Main FastAPI application for handling AI-powered customer conversations
"""

import os
import logging
from contextlib import asynccontextmanager
from typing import List, Optional

from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn

from core.conversation_engine import YarnMarketConversationEngine
from core.models import ConversationRequest, ConversationResponse
from core.database import Database
from core.config import Settings
from core.middleware import RequestLoggingMiddleware, PrometheusMiddleware

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global instances
conversation_engine: Optional[YarnMarketConversationEngine] = None
database: Optional[Database] = None
settings = Settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown logic"""
    global conversation_engine, database
    
    logger.info("🚀 Starting YarnMarket AI Conversation Engine...")
    
    # Initialize database
    database = Database(settings.database_url)
    await database.connect()
    
    # Initialize conversation engine
    conversation_engine = YarnMarketConversationEngine(
        settings=settings,
        database=database
    )
    await conversation_engine.initialize()
    
    logger.info("✅ Conversation Engine initialized successfully")
    yield
    
    # Cleanup
    if conversation_engine:
        await conversation_engine.cleanup()
    if database:
        await database.disconnect()
    
    logger.info("🛑 Conversation Engine shutdown complete")


# Create FastAPI app
app = FastAPI(
    title="YarnMarket AI Conversation Engine",
    description="AI-powered conversational commerce for WhatsApp",
    version="1.0.0",
    lifespan=lifespan
)

# Add middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(RequestLoggingMiddleware)
app.add_middleware(PrometheusMiddleware)


def get_conversation_engine() -> YarnMarketConversationEngine:
    """Dependency to get conversation engine instance"""
    if conversation_engine is None:
        raise HTTPException(status_code=500, detail="Conversation engine not initialized")
    return conversation_engine


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "conversation-engine",
        "version": "1.0.0"
    }


@app.post("/conversation/process", response_model=ConversationResponse)
async def process_conversation(
    request: ConversationRequest,
    background_tasks: BackgroundTasks,
    engine: YarnMarketConversationEngine = Depends(get_conversation_engine)
):
    """
    Process a conversation message and generate AI response
    """
    try:
        logger.info(f"Processing message from {request.customer_phone}")
        
        response = await engine.process_message(request)
        
        # Log interaction in background
        background_tasks.add_task(
            engine.log_interaction,
            request,
            response
        )
        
        return response
        
    except Exception as e:
        logger.error(f"Error processing conversation: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Processing error: {str(e)}")


@app.post("/conversation/voice", response_model=ConversationResponse)
async def process_voice_message(
    request: ConversationRequest,
    background_tasks: BackgroundTasks,
    engine: YarnMarketConversationEngine = Depends(get_conversation_engine)
):
    """
    Process a voice message and generate AI response
    """
    try:
        if not request.audio_url:
            raise HTTPException(status_code=400, detail="Audio URL required for voice messages")
            
        logger.info(f"Processing voice message from {request.customer_phone}")
        
        response = await engine.process_voice_message(request)
        
        # Log interaction in background
        background_tasks.add_task(
            engine.log_interaction,
            request,
            response
        )
        
        return response
        
    except Exception as e:
        logger.error(f"Error processing voice message: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Voice processing error: {str(e)}")


@app.get("/conversation/{customer_phone}/history")
async def get_conversation_history(
    customer_phone: str,
    merchant_id: str,
    limit: int = 50,
    engine: YarnMarketConversationEngine = Depends(get_conversation_engine)
):
    """
    Get conversation history for a customer
    """
    try:
        history = await engine.get_conversation_history(
            customer_phone=customer_phone,
            merchant_id=merchant_id,
            limit=limit
        )
        return {"history": history}
        
    except Exception as e:
        logger.error(f"Error fetching conversation history: {str(e)}")
        raise HTTPException(status_code=500, detail=f"History fetch error: {str(e)}")


@app.post("/merchant/{merchant_id}/train")
async def train_merchant_model(
    merchant_id: str,
    training_data: dict,
    background_tasks: BackgroundTasks,
    engine: YarnMarketConversationEngine = Depends(get_conversation_engine)
):
    """
    Train merchant-specific conversation model
    """
    try:
        # Start training in background
        background_tasks.add_task(
            engine.train_merchant_model,
            merchant_id,
            training_data
        )
        
        return {"message": "Training started", "merchant_id": merchant_id}
        
    except Exception as e:
        logger.error(f"Error starting model training: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Training error: {str(e)}")


@app.get("/merchant/{merchant_id}/analytics")
async def get_merchant_analytics(
    merchant_id: str,
    days: int = 7,
    engine: YarnMarketConversationEngine = Depends(get_conversation_engine)
):
    """
    Get conversation analytics for a merchant
    """
    try:
        analytics = await engine.get_merchant_analytics(
            merchant_id=merchant_id,
            days=days
        )
        return analytics
        
    except Exception as e:
        logger.error(f"Error fetching analytics: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Analytics error: {str(e)}")


@app.get("/metrics")
async def get_metrics():
    """Prometheus metrics endpoint"""
    from prometheus_client import generate_latest, CONTENT_TYPE_LATEST
    return JSONResponse(
        content=generate_latest().decode('utf-8'),
        media_type=CONTENT_TYPE_LATEST
    )


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8001,
        reload=True,
        log_level="info"
    )