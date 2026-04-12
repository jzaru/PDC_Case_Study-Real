from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
import sys
import logging
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

try:
    from api.routes.analytics import router, initialize_services_api
except ModuleNotFoundError:
    from .api.routes.analytics import router, initialize_services_api

# Create FastAPI app
app = FastAPI(
    title="Stock Trading API",
    description="Stock market trading simulation platform",
    version="1.0.0"
)

# Configure CORS - Allow frontend to communicate with backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(router)

# Initialize services on startup
@app.on_event("startup")
async def startup_event():
    """Initialize all services"""
    try:
        initialize_services_api()
        logger.info("✓ Analytics services initialized successfully")
        print("✓ Analytics services initialized")
    except Exception as e:
        logger.error(f"Failed to initialize services: {e}")
        raise


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    print("✓ Application shutting down")


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Stock Trading API",
        "endpoints": {
            "dashboard": "/api/dashboard",
            "stocks": "/api/stocks",
            "stock_history": "/api/stocks/{symbol}",
            "stock_analysis": "/api/stocks/{symbol}/analysis",
            "portfolio": "/api/portfolio/{user_id}",
            "buy_stock": "POST /api/portfolio/{user_id}/buy",
            "sell_stock": "POST /api/portfolio/{user_id}/sell",
            "transactions": "/api/portfolio/{user_id}/transactions"
        }
    }


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    logger.info(f"Starting Stock Trading API on http://0.0.0.0:{port}")
    uvicorn.run(app, host="0.0.0.0", port=port)
