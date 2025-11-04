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

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import os
from pathlib import Path

# Import routers (will be created in next phases)
# These imports will work once we create the router files
try:
    from recommendations import router as recommendations_router
    from users import router as users_router
    from audit import router as audit_router
    ROUTERS_AVAILABLE = True
except ImportError:
    ROUTERS_AVAILABLE = False
    print("⚠️  Warning: Router modules not yet created")


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
            "stats": "/api/operator/stats"
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
    
    print("✓ All routers registered successfully")
else:
    print("⚠️  Routers not yet available - create recommendations.py, users.py, audit.py")


# ========================================================================
# Error Handlers
# ========================================================================

@app.exception_handler(ValueError)
async def value_error_handler(request, exc):
    """Handle ValueError exceptions (business logic errors)"""
    return JSONResponse(
        status_code=400,
        content={"error": "Bad Request", "detail": str(exc)}
    )


@app.exception_handler(404)
async def not_found_handler(request, exc):
    """Handle 404 Not Found errors"""
    return JSONResponse(
        status_code=404,
        content={"error": "Not Found", "detail": "The requested resource was not found"}
    )


# ========================================================================
# Startup/Shutdown Events
# ========================================================================

@app.on_event("startup")
async def startup_event():
    """
    Run initialization tasks on application startup.
    """
    print("=" * 70)
    print("SpendSense Operator Dashboard API")
    print("=" * 70)
    print(f"API Version: 1.0.0")
    print(f"Documentation: http://localhost:8000/docs")
    print(f"Health Check: http://localhost:8000/health")
    print(f"CORS Origins: {cors_origins}")
    
    # Verify database
    try:
        from database import verify_database
        if verify_database():
            print("✓ Database verification passed")
        else:
            print("⚠️  Warning: Database verification failed")
            print("   Run: python -c 'from database import init_database; init_database()'")
    except Exception as e:
        print(f"⚠️  Warning: Could not verify database: {e}")
    
    print("=" * 70)
    print()


@app.on_event("shutdown")
async def shutdown_event():
    """
    Cleanup tasks on application shutdown.
    """
    print("Shutting down SpendSense Operator Dashboard API...")


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

