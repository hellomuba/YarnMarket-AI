"""
FastAPI middleware for YarnMarket AI
"""

import time
import logging
from typing import Callable
from fastapi import Request, Response
from fastapi.middleware.base import BaseHTTPMiddleware
from prometheus_client import Counter, Histogram

logger = logging.getLogger(__name__)

# Prometheus metrics
REQUEST_COUNT = Counter(
    'http_requests_total',
    'Total HTTP requests',
    ['method', 'endpoint', 'status_code']
)

REQUEST_DURATION = Histogram(
    'http_request_duration_seconds', 
    'HTTP request duration',
    ['method', 'endpoint']
)


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Middleware for request logging and metrics"""
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        start_time = time.time()
        
        # Process request
        response = await call_next(request)
        
        # Calculate duration
        duration = time.time() - start_time
        
        # Log request
        logger.info(
            f"{request.method} {request.url.path} - "
            f"{response.status_code} - {duration:.3f}s"
        )
        
        # Update metrics
        REQUEST_COUNT.labels(
            method=request.method,
            endpoint=request.url.path,
            status_code=response.status_code
        ).inc()
        
        REQUEST_DURATION.labels(
            method=request.method,
            endpoint=request.url.path
        ).observe(duration)
        
        return response


class PrometheusMiddleware(BaseHTTPMiddleware):
    """Middleware for Prometheus metrics collection"""
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Skip metrics collection for /metrics endpoint
        if request.url.path == "/metrics":
            return await call_next(request)
        
        start_time = time.time()
        response = await call_next(request)
        duration = time.time() - start_time
        
        # Record metrics
        REQUEST_DURATION.labels(
            method=request.method,
            endpoint=request.url.path
        ).observe(duration)
        
        return response