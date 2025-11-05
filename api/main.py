"""
SpendSense Operator Dashboard API - Main Application

FastAPI application providing REST API for operator actions on AI-generated
financial recommendations.

Features:
- Operator actions (approve, reject, modify, flag)
- Bulk operations
- Audit logging
- Decision traces
- User context (signals, personas)
- Real-time statistics

Run with: python main.py
API Docs: http://localhost:8000/docs
"""

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import os
import logging
from datetime import datetime
from pathlib import Path

# ========================================================================
# Logging Configuration
# ========================================================================

# Configure logging
log_filename = f'operator_dashboard_{datetime.now().strftime("%Y%m%d")}.log'
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(log_filename),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

# Import routers (will be created in next phases)
# These imports will work once we create the router files
try:
    from recommendations import router as recommendations_router
    from users import router as users_router
    from audit import router as audit_router
    from alerts import router as alerts_router
    ROUTERS_AVAILABLE = True
except ImportError as e:
    ROUTERS_AVAILABLE = False
    logger.warning(f"Router modules not yet created: {e}")

# Try to import personas router separately (since it's newly added)
try:
    from personas import router as personas_router
    PERSONAS_ROUTER_AVAILABLE = True
except ImportError as e:
    PERSONAS_ROUTER_AVAILABLE = False
    logger.warning(f"Personas router not available: {e}")

# Try to import auth router
try:
    from auth import router as auth_router
    AUTH_ROUTER_AVAILABLE = True
except ImportError as e:
    AUTH_ROUTER_AVAILABLE = False
    logger.warning(f"Auth router not available: {e}")


# ========================================================================
# FastAPI Application
# ========================================================================

app = FastAPI(
    title="SpendSense Operator Dashboard API",
    description="""
    Backend API for reviewing and managing AI-generated financial recommendations.
    
    ## Features
    
    * **Recommendations Management** - Review, approve, reject, modify recommendations
    * **Bulk Operations** - Process multiple recommendations efficiently  
    * **Audit Trail** - Complete logging of all operator actions
    * **Decision Traces** - Understand AI decision-making process
    * **User Context** - Access user signals and persona history
    * **Statistics** - Real-time operator performance metrics
    
    ## Authentication
    
    Currently uses placeholder operator_id parameter. JWT authentication planned for production.
    """,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)


# ========================================================================
# CORS Middleware
# ========================================================================

# Get CORS origins from environment (comma-separated)
cors_origins_env = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:3001")
cors_origins = [origin.strip() for origin in cors_origins_env.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
    expose_headers=["*"]
)


# ========================================================================
# Request Logging Middleware
# ========================================================================

@app.middleware("http")
async def log_requests(request: Request, call_next):
    """
    Middleware to log all incoming requests and responses
    Logs method, URL, status code, and processing time
    """
    start_time = datetime.now()
    
    # Log incoming request
    logger.info(f"Request: {request.method} {request.url.path}")
    
    # Process request
    response = await call_next(request)
    
    # Calculate processing time
    process_time = (datetime.now() - start_time).total_seconds()
    
    # Log response
    logger.info(
        f"Response: {request.method} {request.url.path} - "
        f"Status: {response.status_code} - "
        f"Time: {process_time:.3f}s"
    )
    
    # Add processing time header
    response.headers["X-Process-Time"] = str(process_time)
    
    return response


# ========================================================================
# Root Endpoints
# ========================================================================

@app.get("/", tags=["Info"])
def root():
    """
    API information and welcome message.
    """
    return {
        "message": "SpendSense Operator Dashboard API",
        "version": "1.0.0",
        "status": "operational",
        "docs": "/docs",
        "health": "/health",
        "endpoints": {
            "recommendations": "/api/operator/recommendations",
            "users": "/api/operator/users",
            "audit": "/api/operator/audit-logs",
            "stats": "/api/operator/stats",
            "personas": "/api/personas"
        }
    }


@app.get("/health", tags=["Health"])
def health_check():
    """
    Health check endpoint for monitoring and load balancers.
    
    Returns:
        dict: Health status
    """
    try:
        # Test database connection
        from database import get_db
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT 1")
            cursor.fetchone()
        
        db_status = "healthy"
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"
    
    return {
        "status": "healthy" if db_status == "healthy" else "degraded",
        "database": db_status,
        "api_version": "1.0.0"
    }


# ========================================================================
# Include Routers
# ========================================================================

if ROUTERS_AVAILABLE:
    # Recommendations endpoints
    app.include_router(
        recommendations_router, 
        prefix="/api/operator",
        tags=["Recommendations"]
    )
    
    # Users endpoints  
    app.include_router(
        users_router,
        prefix="/api/operator", 
        tags=["Users"]
    )
    
    # Audit endpoints
    app.include_router(
        audit_router,
        prefix="/api/operator",
        tags=["Audit"]
    )
    
    # Alerts endpoints
    app.include_router(
        alerts_router,
        prefix="/api/operator",
        tags=["Alerts"]
    )
    
    print("✓ All operator routers registered successfully")
else:
    print("⚠️  Operator routers not yet available - create recommendations.py, users.py, audit.py, alerts.py")

# Register personas router separately (newly added)
if PERSONAS_ROUTER_AVAILABLE:
    app.include_router(
        personas_router,
        prefix="/api",
        tags=["Personas"]
    )
    print("✓ Personas router registered successfully")
else:
    print("⚠️  Personas router not available - create personas.py")

# Register auth router
if AUTH_ROUTER_AVAILABLE:
    app.include_router(
        auth_router,
        prefix="/api/auth",
        tags=["Authentication"]
    )
    print("✓ Auth router registered successfully")
else:
    print("⚠️  Auth router not available - create auth.py")


# ========================================================================
# Error Handlers
# ========================================================================

@app.exception_handler(ValueError)
async def value_error_handler(request, exc):
    """Handle ValueError exceptions (business logic errors)"""
    logger.error(f"ValueError: {exc}", exc_info=True)
    return JSONResponse(
        status_code=400,
        content={"error": "Bad Request", "detail": str(exc)}
    )


@app.exception_handler(404)
async def not_found_handler(request, exc):
    """Handle 404 Not Found errors"""
    logger.warning(f"404 Not Found: {request.url.path}")
    return JSONResponse(
        status_code=404,
        content={"error": "Not Found", "detail": "The requested resource was not found"}
    )


@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    """Handle all uncaught exceptions"""
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"error": "Internal Server Error", "detail": "An unexpected error occurred"}
    )


# ========================================================================
# Startup/Shutdown Events
# ========================================================================

@app.on_event("startup")
async def startup_event():
    """
    Run initialization tasks on application startup.
    """
    logger.info("=" * 70)
    logger.info("SpendSense Operator Dashboard API - Starting Up")
    logger.info("=" * 70)
    logger.info(f"API Version: 1.0.0")
    logger.info(f"Documentation: http://localhost:8000/docs")
    logger.info(f"Health Check: http://localhost:8000/health")
    logger.info(f"CORS Origins: {cors_origins}")
    logger.info(f"Log File: {log_filename}")
    
    # Verify database
    try:
        from database import verify_database
        if verify_database():
            logger.info("✓ Database verification passed")
        else:
            logger.warning("Database verification failed")
            logger.warning("Run: python -c 'from database import init_database; init_database()'")
    except Exception as e:
        logger.error(f"Could not verify database: {e}", exc_info=True)
    
    logger.info("=" * 70)
    logger.info("API ready to accept requests")


@app.on_event("shutdown")
async def shutdown_event():
    """
    Cleanup tasks on application shutdown.
    """
    logger.info("Shutting down SpendSense Operator Dashboard API...")


# ========================================================================
# Main Entry Point
# ========================================================================

if __name__ == "__main__":
    # Get configuration from environment
    host = os.getenv("API_HOST", "0.0.0.0")
    port = int(os.getenv("API_PORT", "8000"))
    reload = os.getenv("DEBUG", "true").lower() == "true"
    
    print()
    print("Starting development server...")
    print(f"Host: {host}")
    print(f"Port: {port}")
    print(f"Reload: {reload}")
    print()
    
    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=reload,
        log_level="info"
    )

