"""AI-Powered Logistics Monitoring System - Main Application Entry Point

This module initializes and configures the FastAPI application with all necessary
middleware, security features, and enterprise-grade configurations.

Compliance: SOC 2, GDPR, PCI-DSS, ISO 27001
Security: TLS 1.3, AES-256, RBAC, MFA
Author: Backend Engineering Automation Architect
Version: 1.0.0
"""

import logging
import sys
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from prometheus_fastapi_instrumentator import Instrumentator

from src.configs.app_config import settings
from src.configs.database import database_manager
from src.configs.logging_config import setup_logging
from src.configs.security_config import SecurityConfig
from src.controllers import (
    analytics_controller,
    auth_controller,
    integration_controller,
    notification_controller,
    shipment_controller,
)
from src.resources.audit_logger import AuditLogger
from src.resources.encryption_service import EncryptionService
from src.resources.rate_limiter import RateLimiter

# Initialize logging
setup_logging()
logger = logging.getLogger(__name__)

# Initialize security services
audit_logger = AuditLogger()
encryption_service = EncryptionService()
rate_limiter = RateLimiter()


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator:
    """Application lifespan manager for startup and shutdown events."""
    # Startup
    logger.info("Starting AI-Powered Logistics Monitoring System")
    try:
        await database_manager.connect()
        logger.info("Database connection established")
        
        # Initialize encryption keys
        encryption_service.initialize()
        logger.info("Encryption service initialized")
        
        # Log startup event
        await audit_logger.log_system_event(
            event_type="SYSTEM_STARTUP",
            details={"version": settings.APP_VERSION, "environment": settings.ENVIRONMENT}
        )
        
        yield
        
    finally:
        # Shutdown
        logger.info("Shutting down application")
        await database_manager.disconnect()
        await audit_logger.log_system_event(
            event_type="SYSTEM_SHUTDOWN",
            details={"version": settings.APP_VERSION}
        )
        logger.info("Application shutdown complete")


# Initialize FastAPI application
app = FastAPI(
    title=settings.APP_NAME,
    description="Enterprise-grade API for AI-powered logistics monitoring and tracking system",
    version=settings.APP_VERSION,
    docs_url="/api/docs" if settings.ENVIRONMENT != "production" else None,
    redoc_url="/api/redoc" if settings.ENVIRONMENT != "production" else None,
    openapi_url="/api/openapi.json" if settings.ENVIRONMENT != "production" else None,
    lifespan=lifespan,
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    allow_headers=["*"],
    expose_headers=["X-RateLimit-Limit", "X-RateLimit-Remaining", "X-RateLimit-Reset"],
)

# Add security middleware
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=settings.ALLOWED_HOSTS,
)

# Add compression middleware
app.add_middleware(GZipMiddleware, minimum_size=1000)

# Initialize Prometheus metrics
Instrumentator().instrument(app).expose(app, endpoint="/metrics")


@app.middleware("http")
async def security_headers_middleware(request: Request, call_next):
    """Add security headers to all responses."""
    response = await call_next(request)
    
    # Security headers
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["Content-Security-Policy"] = "default-src 'self'"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
    
    return response


@app.middleware("http")
async def audit_logging_middleware(request: Request, call_next):
    """Log all API requests for audit purposes."""
    # Generate request ID
    request_id = audit_logger.generate_request_id()
    request.state.request_id = request_id
    
    # Log request
    await audit_logger.log_api_request(
        request_id=request_id,
        method=request.method,
        path=request.url.path,
        client_ip=request.client.host if request.client else "unknown",
        user_agent=request.headers.get("user-agent", "unknown"),
    )
    
    try:
        response = await call_next(request)
        
        # Log response
        await audit_logger.log_api_response(
            request_id=request_id,
            status_code=response.status_code,
        )
        
        return response
    except Exception as e:
        logger.error(f"Request {request_id} failed: {str(e)}")
        await audit_logger.log_api_error(
            request_id=request_id,
            error=str(e),
        )
        raise


@app.middleware("http")
async def rate_limiting_middleware(request: Request, call_next):
    """Apply rate limiting based on user tier."""
    # Skip rate limiting for health checks
    if request.url.path in ["/health", "/metrics"]:
        return await call_next(request)
    
    # Get user tier from request (default to standard)
    user_tier = getattr(request.state, "user_tier", "standard")
    client_id = request.headers.get("X-API-Key") or (
        request.client.host if request.client else "unknown"
    )
    
    # Check rate limit
    is_allowed, remaining, reset_time = await rate_limiter.check_rate_limit(
        client_id=client_id,
        tier=user_tier,
    )
    
    if not is_allowed:
        return JSONResponse(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            content={
                "error": {
                    "code": "RATE_LIMIT_EXCEEDED",
                    "message": "Rate limit exceeded. Please try again later.",
                    "request_id": getattr(request.state, "request_id", "unknown"),
                }
            },
            headers={
                "Retry-After": str(reset_time),
                "X-RateLimit-Limit": str(rate_limiter.get_limit(user_tier)),
                "X-RateLimit-Remaining": "0",
                "X-RateLimit-Reset": str(reset_time),
            },
        )
    
    response = await call_next(request)
    
    # Add rate limit headers
    response.headers["X-RateLimit-Limit"] = str(rate_limiter.get_limit(user_tier))
    response.headers["X-RateLimit-Remaining"] = str(remaining)
    response.headers["X-RateLimit-Reset"] = str(reset_time)
    
    return response


# Include routers
app.include_router(
    auth_controller.router,
    prefix="/api/v1/auth",
    tags=["Authentication"],
)

app.include_router(
    shipment_controller.router,
    prefix="/api/v1/shipments",
    tags=["Shipment Tracking"],
)

app.include_router(
    analytics_controller.router,
    prefix="/api/v1/analytics",
    tags=["Analytics"],
)

app.include_router(
    notification_controller.router,
    prefix="/api/v1/notifications",
    tags=["Notifications"],
)

app.include_router(
    integration_controller.router,
    prefix="/api/v1/integrations",
    tags=["Integrations"],
)


@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint."""
    db_status = await database_manager.health_check()
    return {
        "status": "healthy" if db_status else "unhealthy",
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
        "database": "connected" if db_status else "disconnected",
    }


@app.get("/", tags=["Root"])
async def root():
    """Root endpoint."""
    return {
        "message": "AI-Powered Logistics Monitoring System API",
        "version": settings.APP_VERSION,
        "docs": "/api/docs" if settings.ENVIRONMENT != "production" else "Contact API team",
    }


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "src.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.ENVIRONMENT == "development",
        log_level="info",
        access_log=True,
    )