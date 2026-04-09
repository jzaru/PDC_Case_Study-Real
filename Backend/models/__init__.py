from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class StockData(BaseModel):
    """Model for raw stock data from CSV"""
    timestamp: str
    symbol: str
    open: float
    high: float
    low: float
    close: float
    volume: int


class StockPrice(BaseModel):
    """Model for current stock price"""
    symbol: str
    current_price: float
    date: str


class StockAnalysis(BaseModel):
    """Model for stock analysis results"""
    symbol: str
    current_price: float
    moving_average_10: float
    moving_average_20: float
    volatility: float
    recommendation: str  # BUY, SELL, HOLD
    confidence: float
    date: str


class Transaction(BaseModel):
    """Model for buy/sell transactions"""
    transaction_id: str
    symbol: str
    transaction_type: str  # BUY or SELL
    quantity: int
    price: float
    total_amount: float
    timestamp: datetime


class Portfolio(BaseModel):
    """Model for user portfolio"""
    user_id: str
    holdings: dict  # {symbol: quantity}
    transaction_history: List[Transaction]
    total_invested: float
    current_value: float
    profit_loss: float


class PortfolioResponse(BaseModel):
    """Response model for portfolio data"""
    total_invested: float
    current_value: float
    profit_loss: float
    profit_loss_percent: float
    holdings: dict


class BuyRequest(BaseModel):
    """Request model for buying stocks"""
    symbol: str
    quantity: int


class SellRequest(BaseModel):
    """Request model for selling stocks"""
    symbol: str
    quantity: int


class BuyResponse(BaseModel):
    """Response model for buy transaction"""
    success: bool
    message: str
    transaction_id: Optional[str]
    price: Optional[float]
    total_amount: Optional[float]


class SellResponse(BaseModel):
    """Response model for sell transaction"""
    success: bool
    message: str
    transaction_id: Optional[str]
    price: Optional[float]
    total_amount: Optional[float]
    profit_loss: Optional[float]
