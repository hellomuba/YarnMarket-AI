"""
Configuration settings for the conversation engine
"""

import os
from typing import List, Optional
from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    """Application settings"""
    
    # Database URLs
    database_url: str = Field(
        default="postgresql://yarnmarket:password@localhost:5432/yarnmarket",
        description="PostgreSQL database URL"
    )
    redis_url: str = Field(
        default="redis://localhost:6379",
        description="Redis URL for caching and sessions"
    )
    mongodb_url: str = Field(
        default="mongodb://localhost:27017/yarnmarket",
        description="MongoDB URL for conversation storage"
    )
    
    # API Keys
    openai_api_key: Optional[str] = Field(
        default=None,
        description="OpenAI API key for GPT-4 fallback"
    )
    
    # Model Settings
    model_path: str = Field(
        default="./models",
        description="Path to AI model files"
    )
    use_gpu: bool = Field(
        default=True,
        description="Whether to use GPU for model inference"
    )
    max_batch_size: int = Field(
        default=32,
        description="Maximum batch size for model inference"
    )
    model_cache_size: int = Field(
        default=1000,
        description="Size of model response cache"
    )
    
    # Conversation Settings
    max_conversation_history: int = Field(
        default=50,
        description="Maximum number of messages to keep in conversation history"
    )
    response_timeout: float = Field(
        default=5.0,
        description="Maximum time to generate a response (seconds)"
    )
    confidence_threshold: float = Field(
        default=0.7,
        description="Minimum confidence for AI responses"
    )
    
    # Audio Processing
    whisper_model: str = Field(
        default="base",
        description="Whisper model size (tiny, base, small, medium, large)"
    )
    max_audio_duration: int = Field(
        default=300,
        description="Maximum audio duration in seconds"
    )
    
    # Negotiation Settings
    max_negotiation_rounds: int = Field(
        default=5,
        description="Maximum number of negotiation rounds"
    )
    min_profit_margin: float = Field(
        default=0.1,
        description="Minimum profit margin to maintain"
    )
    
    # Rate Limiting
    max_requests_per_minute: int = Field(
        default=60,
        description="Maximum requests per minute per customer"
    )
    
    # Monitoring
    enable_metrics: bool = Field(
        default=True,
        description="Enable Prometheus metrics collection"
    )
    metrics_port: int = Field(
        default=8090,
        description="Port for metrics endpoint"
    )
    
    # Logging
    log_level: str = Field(
        default="INFO",
        description="Logging level"
    )
    log_conversations: bool = Field(
        default=True,
        description="Whether to log full conversations"
    )
    
    # Security
    encrypt_conversations: bool = Field(
        default=True,
        description="Whether to encrypt stored conversations"
    )
    conversation_retention_days: int = Field(
        default=90,
        description="Days to retain conversation data"
    )
    
    # Development
    debug: bool = Field(
        default=False,
        description="Enable debug mode"
    )
    mock_whatsapp: bool = Field(
        default=False,
        description="Use mock WhatsApp responses for testing"
    )
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False