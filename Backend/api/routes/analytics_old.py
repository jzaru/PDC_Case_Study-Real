import logging
from datetime import datetime

logger = logging.getLogger(__name__)

# In-memory storage for demo
holdings = {
    "user_demo_001": {
        "AAPL": {"quantity": 10, "avg_price": 145.00},
        "GOOGL": {"quantity": 2, "avg_price": 2750.00}
    }
}

transactions = {
    "user_demo_001": [
        {"id": 1, "symbol": "AAPL", "type": "BUY", "shares": 10, "price": 145.00, "date": "2024-01-01"},
        {"id": 2, "symbol": "GOOGL", "type": "SELL", "shares": 2, "price": 2750.00, "date": "2024-01-02"}
    ]
}

router = APIRouter(prefix="/api", tags=["analytics"])

# Initialize loader and services (global, loaded once)
loader = None
analytics_svc = None
inventory_svc = None
transaction_svc = None
delivery_svc = None


def initialize_services_api():
    """Call this in server.py startup"""
    global loader, analytics_svc, inventory_svc, transaction_svc, delivery_svc
    loader = CSVDataLoader()
    loader.load_all()
    analytics_svc = AnalyticsService(loader)
    inventory_svc = InventoryService(loader)
    transaction_svc = TransactionService(loader)
    delivery_svc = DeliveryService(loader)


# ============ DASHBOARD ENDPOINTS ============

@router.get("/dashboard")
async def get_dashboard():
    """⭐ High-level business overview"""
    if not analytics_svc:
        raise HTTPException(status_code=500, detail="Services not initialized")
    return analytics_svc.get_dashboard_summary()


# ============ STOCK TRADING ENDPOINTS (Mock for compatibility) ============

@router.get("/stocks")
async def get_stocks():
    """Get all available stocks"""
    logger.info("Fetching all stocks")
    return [
        {"symbol": "AAPL", "name": "Apple Inc.", "current_price": 150.25, "change": 2.5},
        {"symbol": "GOOGL", "name": "Alphabet Inc.", "current_price": 2800.00, "change": -1.2},
        {"symbol": "MSFT", "name": "Microsoft Corp.", "current_price": 305.50, "change": 0.8},
        {"symbol": "TSLA", "name": "Tesla Inc.", "current_price": 220.75, "change": 5.3},
        {"symbol": "AMZN", "name": "Amazon.com Inc.", "current_price": 3200.00, "change": -0.5}
    ]

@router.get("/portfolio")
async def get_portfolio(user_id: str = "user_demo_001"):
    """Get user portfolio"""
    user_holdings = holdings.get(user_id, {})
    stocks_data = [
        {"symbol": "AAPL", "name": "Apple Inc.", "current_price": 150.25},
        {"symbol": "GOOGL", "name": "Alphabet Inc.", "current_price": 2800.00},
        {"symbol": "MSFT", "name": "Microsoft Corp.", "current_price": 305.50},
        {"symbol": "TSLA", "name": "Tesla Inc.", "current_price": 220.75},
        {"symbol": "AMZN", "name": "Amazon.com Inc.", "current_price": 3200.00}
    ]
    stocks_dict = {s["symbol"]: s for s in stocks_data}
    
    portfolio_holdings = []
    total_value = 0
    for symbol, h in user_holdings.items():
        current_price = stocks_dict.get(symbol, {}).get("current_price", 0)
        value = h["quantity"] * current_price
        total_value += value
        portfolio_holdings.append({
            "symbol": symbol,
            "shares": h["quantity"],
            "avg_price": h["avg_price"],
            "current_price": current_price,
            "value": value,
            "profit_loss": value - (h["quantity"] * h["avg_price"])
        })
    
    return {
        "total_value": total_value,
        "cash_balance": 10000.00,  # Mock
        "profit_loss": sum(h["profit_loss"] for h in portfolio_holdings),
        "holdings": portfolio_holdings
    }

@router.get("/stocks/{symbol}/analysis")
async def get_stock_analysis(symbol: str):
    """Get stock analysis"""
    analyses = {
        "AAPL": {"current_price": 150.25, "recommendation": "BUY", "confidence": 0.85},
        "GOOGL": {"current_price": 2800.00, "recommendation": "HOLD", "confidence": 0.65},
        "MSFT": {"current_price": 305.50, "recommendation": "BUY", "confidence": 0.78},
        "TSLA": {"current_price": 220.75, "recommendation": "SELL", "confidence": 0.72},
        "AMZN": {"current_price": 3200.00, "recommendation": "BUY", "confidence": 0.81}
    }
    return analyses.get(symbol, {"current_price": 100.00, "recommendation": "HOLD", "confidence": 0.5})

@router.get("/stocks/{symbol}/history")
async def get_stock_history(symbol: str):
    """Get stock price history"""
    return {
        "history": [
            {"date": "2024-01-01", "close": 145.00, "open": 144.50},
            {"date": "2024-01-02", "close": 147.50, "open": 145.20},
            {"date": "2024-01-03", "close": 150.25, "open": 147.80}
        ]
    }

@router.post("/portfolio/buy")
async def buy_stock(request: dict):
    """Buy stock"""
    user_id = request.get("user_id", "user_demo_001")
    symbol = request.get("symbol")
    quantity = request.get("quantity", 1)
    
    if not symbol:
        return {"success": False, "message": "Symbol required"}
    
    # Get current price
    stocks_data = [
        {"symbol": "AAPL", "current_price": 150.25},
        {"symbol": "GOOGL", "current_price": 2800.00},
        {"symbol": "MSFT", "current_price": 305.50},
        {"symbol": "TSLA", "current_price": 220.75},
        {"symbol": "AMZN", "current_price": 3200.00}
    ]
    price = next((s["current_price"] for s in stocks_data if s["symbol"] == symbol), 100.00)
    
    # Update holdings
    if user_id not in holdings:
        holdings[user_id] = {}
    if symbol not in holdings[user_id]:
        holdings[user_id][symbol] = {"quantity": 0, "avg_price": 0}
    
    current_qty = holdings[user_id][symbol]["quantity"]
    current_avg = holdings[user_id][symbol]["avg_price"]
    total_cost = current_qty * current_avg + quantity * price
    new_qty = current_qty + quantity
    new_avg = total_cost / new_qty if new_qty > 0 else 0
    
    holdings[user_id][symbol] = {"quantity": new_qty, "avg_price": new_avg}
    
    # Add transaction
    if user_id not in transactions:
        transactions[user_id] = []
    trans_id = len(transactions[user_id]) + 1
    transactions[user_id].append({
        "id": trans_id,
        "symbol": symbol,
        "type": "BUY",
        "shares": quantity,
        "price": price,
        "date": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    })
    
    return {"success": True, "message": f"Bought {quantity} shares of {symbol}"}

@router.post("/portfolio/sell")
async def sell_stock(request: dict):
    """Sell stock"""
    user_id = request.get("user_id", "user_demo_001")
    symbol = request.get("symbol")
    quantity = request.get("quantity", 1)
    
    if not symbol or user_id not in holdings or symbol not in holdings[user_id]:
        return {"success": False, "message": "Insufficient holdings"}
    
    current_qty = holdings[user_id][symbol]["quantity"]
    if current_qty < quantity:
        return {"success": False, "message": "Insufficient shares"}
    
    # Get current price
    stocks_data = [
        {"symbol": "AAPL", "current_price": 150.25},
        {"symbol": "GOOGL", "current_price": 2800.00},
        {"symbol": "MSFT", "current_price": 305.50},
        {"symbol": "TSLA", "current_price": 220.75},
        {"symbol": "AMZN", "current_price": 3200.00}
    ]
    price = next((s["current_price"] for s in stocks_data if s["symbol"] == symbol), 100.00)
    
    # Update holdings
    new_qty = current_qty - quantity
    if new_qty <= 0:
        del holdings[user_id][symbol]
    else:
        holdings[user_id][symbol]["quantity"] = new_qty
    
    # Add transaction
    if user_id not in transactions:
        transactions[user_id] = []
    trans_id = len(transactions[user_id]) + 1
    transactions[user_id].append({
        "id": trans_id,
        "symbol": symbol,
        "type": "SELL",
        "shares": quantity,
        "price": price,
        "date": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    })
    
    return {"success": True, "message": f"Sold {quantity} shares of {symbol}"}

@router.get("/transactions")
async def get_transactions(user_id: str = "user_demo_001"):
    """Get transaction history"""
    return transactions.get(user_id, [])


@router.get("/inventory/branch/{branch_id}")
async def get_branch_inventory(branch_id: str):
    """Get all inventory for a branch"""
    if not inventory_svc:
        raise HTTPException(status_code=500, detail="Services not initialized")
    return inventory_svc.get_branch_inventory(branch_id)


@router.get("/inventory/valuation")
async def get_inventory_valuation():
    """⭐ Total inventory asset value by branch"""
    if not analytics_svc:
        raise HTTPException(status_code=500, detail="Services not initialized")
    return analytics_svc.get_inventory_valuation()


@router.get("/portfolio", response_model=PortfolioResponse)
async def get_portfolio(user_id: str = None):
    """Current portfolio snapshot derived from inventory and product pricing."""
    if not analytics_svc:
        raise HTTPException(status_code=500, detail="Services not initialized")
    return analytics_svc.get_portfolio_snapshot(user_id=user_id)


# ============ SALES/TRANSACTION ENDPOINTS ============

@router.get("/sales/by-category")
async def get_sales_by_category():
    """⭐ Revenue breakdown by product category"""
    if not analytics_svc:
        raise HTTPException(status_code=500, detail="Services not initialized")
    return analytics_svc.get_sales_by_category()


@router.get("/sales/by-branch")
async def get_branch_performance():
    """⭐ Sales metrics per branch"""
    if not analytics_svc:
        raise HTTPException(status_code=500, detail="Services not initialized")
    return analytics_svc.get_branch_performance()


@router.get("/sales/recent")
async def get_recent_sales(days: int = 7):
    """Recent transactions (last N days)"""
    if not transaction_svc:
        raise HTTPException(status_code=500, detail="Services not initialized")
    return transaction_svc.get_recent_sales(days=days)


# ============ LOGISTICS/DELIVERY ENDPOINTS ============

@router.get("/deliveries/summary")
async def get_delivery_summary():
    """⭐ Delivery performance metrics"""
    if not delivery_svc:
        raise HTTPException(status_code=500, detail="Services not initialized")
    return delivery_svc.get_delivery_summary()


@router.get("/deliveries/delayed")
async def get_delayed_deliveries():
    """⭐ All delayed deliveries (operational concern)"""
    if not delivery_svc:
        raise HTTPException(status_code=500, detail="Services not initialized")
    return delivery_svc.get_delayed_deliveries()


@router.get("/fleet/efficiency")
async def get_fleet_efficiency():
    """⭐ Truck utilization and fuel costs"""
    if not analytics_svc:
        raise HTTPException(status_code=500, detail="Services not initialized")
    return analytics_svc.get_fleet_efficiency()
