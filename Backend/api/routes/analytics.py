"""HIGH-PERFORMANCE stock trading API routes"""

from fastapi import APIRouter, HTTPException
from services.stock_service import StockService
from services.portfolio_service import PortfolioService
from services.transaction_service import TransactionService
from data_processing.loaders import StockDataLoader
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["stock-trading"])

# ========================
# GLOBAL SERVICES (LOADED ONCE)
# ========================
loader = None
stock_svc = None
portfolio_svc = None
transaction_svc = None


def initialize_services_api():
    """Initialize once at startup"""
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
# STOCKS (FAST)
# ========================
@router.get("/stocks")
async def get_stocks():
    """🔥 FAST dashboard endpoint (uses simulation index)"""
    if not stock_svc or not portfolio_svc:
        raise HTTPException(status_code=500, detail="Services not initialized")

    sim = portfolio_svc.get_simulation_status()
    index = sim.get("current_index") if sim.get("running") else None

    return stock_svc.get_all_stocks(index=index)


@router.get("/stocks/{company}")
async def get_stock_history(company: str):
    """🔥 FAST single stock endpoint"""
    if not stock_svc or not portfolio_svc:
        raise HTTPException(status_code=500, detail="Services not initialized")

    history = stock_svc.get_stock_history(company)
    if not history:
        raise HTTPException(status_code=404, detail="Stock not found")

    sim = portfolio_svc.get_simulation_status()
    index = sim.get("current_index") if sim.get("running") else None

    # 🔥 ONLY compute for this stock
    data = stock_svc.get_all_stocks(index=index)
    stock_data = next((s for s in data if s["company"] == company), None)

    return {
        "company": company,
        "history": history,
        "price": stock_data["price"] if stock_data else 0,
        "confidence": stock_data["confidence"] if stock_data else 50,
        "action": stock_data["action"] if stock_data else "HOLD"
    }


# ========================
# TRADING
# ========================
@router.post("/buy")
async def buy_stock(request: dict):
    if not portfolio_svc:
        raise HTTPException(status_code=500, detail="Services not initialized")

    company = request.get("company")
    quantity = request.get("quantity", 1)

    if not company:
        raise HTTPException(status_code=400, detail="Company required")

    return portfolio_svc.buy_stock(company, quantity)


@router.post("/sell")
async def sell_stock(request: dict):
    if not portfolio_svc:
        raise HTTPException(status_code=500, detail="Services not initialized")

    company = request.get("company")
    quantity = request.get("quantity", 1)

    if not company:
        raise HTTPException(status_code=400, detail="Company required")

    return portfolio_svc.sell_stock(company, quantity)


# ========================
# PORTFOLIO
# ========================
@router.get("/portfolio")
async def get_portfolio():
    if not portfolio_svc:
        raise HTTPException(status_code=500, detail="Services not initialized")
    return portfolio_svc.get_portfolio()


@router.get("/balance")
async def get_balance():
    if not portfolio_svc:
        raise HTTPException(status_code=500, detail="Services not initialized")
    return {"balance": portfolio_svc.get_balance()}


@router.post("/balance/add")
async def add_balance(request: dict):
    if not portfolio_svc:
        raise HTTPException(status_code=500, detail="Services not initialized")

    amount = request.get("amount", 0)
    if amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be positive")

    return portfolio_svc.add_balance(amount)


@router.post("/balance/subtract")
async def subtract_balance(request: dict):
    if not portfolio_svc:
        raise HTTPException(status_code=500, detail="Services not initialized")

    amount = request.get("amount", 0)
    if amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be positive")

    return portfolio_svc.subtract_balance(amount)


# ========================
# SIMULATION
# ========================
@router.post("/simulation/start")
async def start_simulation():
    if not portfolio_svc:
        raise HTTPException(status_code=500, detail="Services not initialized")
    return portfolio_svc.start_simulation()


@router.post("/simulation/stop")
async def stop_simulation():
    if not portfolio_svc:
        raise HTTPException(status_code=500, detail="Services not initialized")
    return portfolio_svc.stop_simulation()


@router.get("/simulation/status")
async def get_simulation_status():
    if not portfolio_svc:
        raise HTTPException(status_code=500, detail="Services not initialized")
    return portfolio_svc.get_simulation_status()


# ========================
# TRANSACTIONS
# ========================
@router.get("/transactions")
async def get_transactions():
    if not transaction_svc:
        raise HTTPException(status_code=500, detail="Services not initialized")
    return {"transactions": transaction_svc.get_transactions()}