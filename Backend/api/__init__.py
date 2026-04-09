from fastapi import APIRouter, HTTPException
from typing import List
from ..models import (
    StockPrice,
    StockAnalysis,
    BuyRequest,
    BuyResponse,
    SellRequest,
    SellResponse,
    PortfolioResponse
)
from ..services import StockAnalysisService, PortfolioService


router = APIRouter(prefix="/api", tags=["stocks"])

# Initialize services (in production, use dependency injection)
analysis_service = None
portfolio_service = None


def initialize_services(csv_path: str):
    """Initialize services with CSV path"""
    global analysis_service, portfolio_service
    analysis_service = StockAnalysisService(csv_path)
    portfolio_service = PortfolioService(csv_path)


@router.get("/stocks", response_model=List[StockPrice])
async def get_all_stocks():
    """
    Get list of all available stocks with current prices
    """
    if not analysis_service:
        raise HTTPException(status_code=500, detail="Service not initialized")
    
    stocks = analysis_service.get_all_stocks_analysis()
    return [
        StockPrice(
            symbol=stock['symbol'],
            current_price=stock['current_price'],
            date=stock.get('current_date', '')
        )
        for stock in stocks
    ]


@router.get("/stocks/{symbol}", response_model=StockAnalysis)
async def get_stock_analysis(symbol: str):
    """
    Get detailed analysis and recommendation for a specific stock
    """
    if not analysis_service:
        raise HTTPException(status_code=500, detail="Service not initialized")
    
    analysis = analysis_service.get_stock_recommendation(symbol.upper())
    
    if 'current_price' not in analysis:
        raise HTTPException(status_code=404, detail=f"Stock {symbol} not found")
    
    return StockAnalysis(
        symbol=analysis['symbol'],
        current_price=analysis.get('current_price', 0),
        moving_average_10=analysis.get('moving_avg_10', 0),
        moving_average_20=analysis.get('moving_avg_20', 0),
        volatility=analysis.get('volatility', 0),
        recommendation=analysis['recommendation'],
        confidence=analysis['confidence'],
        date=analysis.get('current_date', '')
    )


@router.get("/stocks/{symbol}/history")
async def get_stock_history(symbol: str, limit: int = 20):
    """
    Get price history for a stock
    """
    if not analysis_service:
        raise HTTPException(status_code=500, detail="Service not initialized")
    
    history = analysis_service.get_stock_price_history(symbol.upper(), limit)
    
    if not history:
        raise HTTPException(status_code=404, detail=f"Stock {symbol} not found")
    
    return {"symbol": symbol.upper(), "history": history}


@router.get("/portfolio/{user_id}", response_model=PortfolioResponse)
async def get_portfolio(user_id: str):
    """
    Get user's portfolio with current values and holdings
    """
    if not portfolio_service:
        raise HTTPException(status_code=500, detail="Service not initialized")
    
    portfolio = portfolio_service.get_portfolio(user_id)
    
    return PortfolioResponse(
        total_invested=portfolio['total_invested'],
        current_value=portfolio['current_value'],
        profit_loss=portfolio['profit_loss'],
        profit_loss_percent=portfolio['profit_loss_percent'],
        holdings=portfolio['holdings']
    )


@router.post("/buy", response_model=BuyResponse)
async def buy_stock(user_id: str = "", request: BuyRequest = None):
    """
    Buy a stock
    """
    if not portfolio_service:
        raise HTTPException(status_code=500, detail="Service not initialized")
    
    if not user_id or not request:
        raise HTTPException(status_code=400, detail="user_id and request body required")
    
    result = portfolio_service.buy_stock(user_id, request.symbol.upper(), request.quantity)
    
    return BuyResponse(
        success=result['success'],
        message=result['message'],
        transaction_id=result.get('transaction_id'),
        price=result.get('price'),
        total_amount=result.get('total_amount')
    )


@router.post("/sell", response_model=SellResponse)
async def sell_stock(user_id: str = "", request: SellRequest = None):
    """
    Sell a stock
    """
    if not portfolio_service:
        raise HTTPException(status_code=500, detail="Service not initialized")
    
    if not user_id or not request:
        raise HTTPException(status_code=400, detail="user_id and request body required")
    
    result = portfolio_service.sell_stock(user_id, request.symbol.upper(), request.quantity)
    
    return SellResponse(
        success=result['success'],
        message=result['message'],
        transaction_id=result.get('transaction_id'),
        price=result.get('price'),
        total_amount=result.get('total_amount'),
        profit_loss=result.get('profit_loss')
    )


@router.get("/transactions/{user_id}")
async def get_transactions(user_id: str, limit: int = 50):
    """
    Get transaction history for a user
    """
    if not portfolio_service:
        raise HTTPException(status_code=500, detail="Service not initialized")
    
    transactions = portfolio_service.get_transactions(user_id, limit)
    
    return {
        "user_id": user_id,
        "transaction_count": len(transactions),
        "transactions": transactions
    }


@router.get("/analysis/all")
async def get_all_analysis():
    """
    Get analysis and recommendations for all stocks
    Uses parallel processing demonstrated in data_processing module
    """
    if not analysis_service:
        raise HTTPException(status_code=500, detail="Service not initialized")
    
    analysis = analysis_service.get_all_stocks_analysis()
    
    return {
        "total_stocks": len(analysis),
        "analysis": analysis
    }


@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "message": "Stock Trading Simulation API is running"
    }
