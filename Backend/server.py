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
    from Backend.api.routes.analytics import router, initialize_services_api
except ModuleNotFoundError:
    from api.routes.analytics import router, initialize_services_api

# Create FastAPI app
app = FastAPI(
    title="Logistics & Distribution API",
    description="Building materials distribution system with analytics",
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
        "message": "Logistics & Distribution API",
        "endpoints": {
            "dashboard": "/api/dashboard",
            "inventory_low_stock": "/api/inventory/low-stock",
            "inventory_branch": "/api/inventory/branch/{branch_id}",
            "inventory_valuation": "/api/inventory/valuation",
            "sales_by_category": "/api/sales/by-category",
            "sales_by_branch": "/api/sales/by-branch",
            "sales_recent": "/api/sales/recent",
            "deliveries_summary": "/api/deliveries/summary",
            "deliveries_delayed": "/api/deliveries/delayed",
            "fleet_efficiency": "/api/fleet/efficiency"
        }
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
