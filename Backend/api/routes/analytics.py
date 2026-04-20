"""HIGH-PERFORMANCE stock trading API routes (FIXED PERFORMANCE BOTTLENECK)"""

from fastapi import APIRouter, HTTPException
from services.stock_service import StockService
from services.portfolio_service import PortfolioService
from services.transaction_service import TransactionService
from data_processing.loaders import StockDataLoader
import logging
import numpy as np

logger = logging.getLogger(__name__)

# 🔥 FIX: numpy → python conversion
def to_python(obj):
    """Convert NumPy types to native Python types for JSON serialization"""
    if isinstance(obj, np.generic):
        return obj.item()
    elif isinstance(obj, dict):
        return {k: to_python(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [to_python(v) for v in obj]
    return obj

router = APIRouter(prefix="/api", tags=["stock-trading"])

# ========================
# GLOBAL SERVICES
# ========================
loader = None
stock_svc = None
portfolio_svc = None
transaction_svc = None


def initialize_services_api():
    global loader, stock_svc, portfolio_svc, transaction_svc

    loader = StockDataLoader()
    stock_svc = StockService(loader)
    transaction_svc = TransactionService()
    portfolio_svc = PortfolioService(stock_svc, transaction_svc)

    print("🔥 Services initialized (OPTIMIZED)")


# ========================
# HEALTH
# ========================
@router.get("/health")
async def health_check():
    return {"status": "healthy"}


# ========================
# STOCKS
# ========================
@router.get("/stocks")
async def get_stocks():
    if not stock_svc or not portfolio_svc:
        raise HTTPException(status_code=500, detail="Services not initialized")

    sim = portfolio_svc.get_simulation_status()
    index = sim.get("current_index") if sim.get("running") else None

    # 🔥 FIX: Convert result to ensure JSON serialization
    result = stock_svc.get_all_stocks(index=index)
    return to_python(result)


@router.get("/stocks/{company}")
async def get_stock_history(company: str):
    if not stock_svc or not portfolio_svc:
        raise HTTPException(status_code=500, detail="Services not initialized")

    history = stock_svc.get_stock_history(company)
    if not history:
        raise HTTPException(status_code=404, detail="Stock not found")

    sim = portfolio_svc.get_simulation_status()
    index = sim.get("current_index") if sim.get("running") else None

    # 🔥 FIX: DO NOT RECOMPUTE ALL STOCKS
    stock_data = stock_svc.get_single_stock(company, index=index)

    # 🔥 FIX: Convert response to ensure JSON serialization
    response = {
        "company": str(company),
        "history": history,
        "price": float(stock_data["price"]) if stock_data else 0.0,
        "confidence": float(stock_data["confidence"]) if stock_data else 50.0,
        "action": str(stock_data["action"]) if stock_data else "HOLD",
        "signal_strength": str(stock_data.get("signal_strength", "WEAK")) if stock_data else "WEAK",
        "trend_direction": str(stock_data.get("trend_direction", "FLAT")) if stock_data else "FLAT",
        "peak_detected": bool(stock_data.get("peak_detected", False)) if stock_data else False
    }
    return to_python(response)


# ========================
# BUY
# ========================
@router.post("/buy")
async def buy_stock(request: dict):
    if not portfolio_svc:
        raise HTTPException(status_code=500, detail="Services not initialized")

    company = request.get("company")
    quantity = request.get("quantity", 1)

    if not company:
        raise HTTPException(status_code=400, detail="Company required")

    try:
        quantity = int(quantity)
    except:
        raise HTTPException(status_code=400, detail="Invalid quantity")

    if quantity <= 0:
        raise HTTPException(status_code=400, detail="Quantity must be > 0")

    return portfolio_svc.buy_stock(company, quantity)


# ========================
# SELL
# ========================
@router.post("/sell")
async def sell_stock(request: dict):
    if not portfolio_svc:
        raise HTTPException(status_code=500, detail="Services not initialized")

    company = request.get("company")
    quantity = request.get("quantity", 1)

    if not company:
        raise HTTPException(status_code=400, detail="Company required")

    try:
        quantity = int(quantity)
    except:
        raise HTTPException(status_code=400, detail="Invalid quantity")

    if quantity <= 0:
        raise HTTPException(status_code=400, detail="Quantity must be > 0")

    return portfolio_svc.sell_stock(company, quantity)


# ========================
# WORKERS
# ========================
@router.post("/workers")
async def set_workers(request: dict):
    if not stock_svc:
        raise HTTPException(status_code=500, detail="Stock service not initialized")

    workers = request.get("workers", 8)

    try:
        workers = int(workers)
    except:
        raise HTTPException(status_code=400, detail="Invalid workers value")

    stock_svc.set_workers(workers)

    return {
        "success": True,
        "workers": stock_svc.get_workers()
    }


@router.get("/workers")
async def get_workers():
    if not stock_svc:
        raise HTTPException(status_code=500, detail="Stock service not initialized")

    return {
        "workers": stock_svc.get_workers()
    }


# ========================
# ML STATS
# ========================
@router.get("/ml-stats")
async def get_ml_stats():
    if not stock_svc:
        raise HTTPException(status_code=500, detail="Stock service not initialized")

    # 🔥 FIX: Convert to ensure JSON serialization
    result = {
        "training_time": float(stock_svc.model.get_training_time())
    }
    return to_python(result)


# ========================
# TRAINING MODE
# ========================
@router.post("/training-mode")
async def set_training_mode(request: dict):
    if not stock_svc:
        raise HTTPException(status_code=500, detail="Stock service not initialized")

    mode = request.get("mode", "FAST")

    return stock_svc.set_training_mode(mode)


@router.get("/training-mode")
async def get_training_mode():
    if not stock_svc:
        raise HTTPException(status_code=500, detail="Stock service not initialized")

    return stock_svc.get_training_mode()


# ========================
# PORTFOLIO
# ========================
@router.get("/portfolio")
async def get_portfolio():
    if not portfolio_svc:
        raise HTTPException(status_code=500, detail="Services not initialized")
    # 🔥 FIX: Convert to ensure JSON serialization
    portfolio = portfolio_svc.get_portfolio()
    return to_python(portfolio)


@router.get("/balance")
async def get_balance():
    if not portfolio_svc:
        raise HTTPException(status_code=500, detail="Services not initialized")
    # 🔥 FIX: Convert to ensure JSON serialization
    result = {"balance": float(portfolio_svc.get_balance())}
    return to_python(result)


@router.post("/balance/add")
async def add_balance(request: dict):
    if not portfolio_svc:
        raise HTTPException(status_code=500, detail="Services not initialized")

    amount = request.get("amount", 0)

    try:
        amount = float(amount)
    except:
        raise HTTPException(status_code=400, detail="Invalid amount")

    if amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be positive")

    return portfolio_svc.add_balance(amount)


@router.post("/balance/subtract")
async def subtract_balance(request: dict):
    if not portfolio_svc:
        raise HTTPException(status_code=500, detail="Services not initialized")

    amount = request.get("amount", 0)

    try:
        amount = float(amount)
    except:
        raise HTTPException(status_code=400, detail="Invalid amount")

    if amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be positive")

    return portfolio_svc.subtract_balance(amount)


# ========================
# SIMULATION
# ========================
@router.post("/simulation/start")
async def start_simulation():
    return portfolio_svc.start_simulation()


@router.post("/simulation/stop")
async def stop_simulation():
    return portfolio_svc.stop_simulation()


@router.get("/simulation/status")
async def get_simulation_status():
    return portfolio_svc.get_simulation_status()


# ========================
# TRANSACTIONS
# ========================
@router.get("/transactions")
async def get_transactions():
    return {"transactions": transaction_svc.get_transactions()}