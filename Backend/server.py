from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
import sys

# Add backend to path
sys.path.insert(0, os.path.dirname(__file__))

from Backend.api import router, initialize_services

# Create FastAPI app
app = FastAPI(
    title="Stock Trading Simulation API",
    description="API for stock trading simulation with real-time analysis and portfolio management",
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
    """Initialize services when app starts"""
    csv_path = os.path.join(os.path.dirname(__file__), "..", "data", "stocks.csv")
    initialize_services(csv_path)
    print(f"✓ Services initialized with data from: {csv_path}")


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    print("✓ Application shutting down")


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Stock Trading Simulation API",
        "endpoints": {
            "stocks": "/api/stocks",
            "stock_detail": "/api/stocks/{symbol}",
            "stock_history": "/api/stocks/{symbol}/history",
            "portfolio": "/api/portfolio/{user_id}",
            "buy": "/api/buy",
            "sell": "/api/sell",
            "transactions": "/api/transactions/{user_id}",
            "analysis": "/api/analysis/all",
            "health": "/api/health"
        }
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
