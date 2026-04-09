import pandas as pd
from typing import Dict, Tuple, List
from datetime import datetime
import uuid
from ..data_processing import (
    batch_process_analysis,
    get_latest_price,
    calculate_moving_average,
    calculate_volatility,
    load_csv_data
)


class StockAnalysisService:
    """Service for analyzing stocks and generating recommendations"""
    
    def __init__(self, csv_path: str):
        self.csv_path = csv_path
        self.df = load_csv_data(csv_path)
        self.analysis_cache = {}
    
    def get_stock_recommendation(self, symbol: str) -> Dict:
        """
        Generate a buy/sell/hold recommendation for a stock
        Based on:
        - Moving average crossover
        - Volatility
        - Price trends
        
        Args:
            symbol: Stock symbol
            
        Returns:
            Dictionary with recommendation and analysis
        """
        if self.df.empty or symbol not in self.df['symbol'].values:
            return {
                'symbol': symbol,
                'recommendation': 'HOLD',
                'confidence': 0,
                'signal': 'No data available'
            }
        
        stock_data = self.df[self.df['symbol'] == symbol].sort_values('timestamp')
        
        if len(stock_data) < 20:
            return {
                'symbol': symbol,
                'recommendation': 'HOLD',
                'confidence': 0,
                'signal': 'Insufficient data'
            }
        
        # Calculate technical indicators
        current_price = stock_data.iloc[-1]['close']
        prev_price = stock_data.iloc[-2]['close'] if len(stock_data) > 1 else current_price
        
        # Moving averages
        ma_10 = stock_data['close'].tail(10).mean()
        ma_20 = stock_data['close'].tail(20).mean()
        
        # Volatility
        volatility = stock_data['close'].std()
        
        # Price momentum
        price_change = ((current_price - stock_data.iloc[0]['close']) / 
                       stock_data.iloc[0]['close'] * 100)
        
        # Generate recommendation
        recommendation, confidence, signal = self._generate_signal(
            current_price, ma_10, ma_20, volatility, price_change
        )
        
        return {
            'symbol': symbol,
            'current_price': round(current_price, 2),
            'moving_avg_10': round(ma_10, 2),
            'moving_avg_20': round(ma_20, 2),
            'volatility': round(volatility, 2),
            'price_change_percent': round(price_change, 2),
            'recommendation': recommendation,
            'confidence': confidence,
            'signal': signal
        }
    
    def _generate_signal(self, price: float, ma_10: float, ma_20: float, 
                        volatility: float, momentum: float) -> Tuple[str, float, str]:
        """
        Generate trading signal based on indicators
        
        Args:
            price: Current price
            ma_10: 10-day moving average
            ma_20: 20-day moving average
            volatility: Price volatility
            momentum: Price momentum percentage
            
        Returns:
            Tuple of (recommendation, confidence, signal)
        """
        signals = 0
        confidence = 0
        signal_reasons = []
        
        # Signal 1: Moving average crossover
        if ma_10 > ma_20:
            signals += 1
            signal_reasons.append("MA10 > MA20 (Bullish)")
        else:
            signals -= 1
            signal_reasons.append("MA10 < MA20 (Bearish)")
        
        # Signal 2: Price vs moving averages
        if price > ma_10:
            signals += 1
            signal_reasons.append("Price above MA10")
        else:
            signals -= 1
            signal_reasons.append("Price below MA10")
        
        # Signal 3: Momentum
        if momentum > 2:
            signals += 1
            signal_reasons.append(f"Positive momentum ({momentum:.2f}%)")
        elif momentum < -2:
            signals -= 1
            signal_reasons.append(f"Negative momentum ({momentum:.2f}%)")
        
        # Volatility consideration (increase confidence)
        volatility_factor = min(volatility / 10, 1)  # Normalize volatility
        
        # Determine recommendation
        if signals >= 2:
            recommendation = "BUY"
            confidence = min(0.8 + volatility_factor * 0.2, 1.0)
        elif signals <= -2:
            recommendation = "SELL"
            confidence = min(0.8 + volatility_factor * 0.2, 1.0)
        else:
            recommendation = "HOLD"
            confidence = 0.5
        
        signal_text = " | ".join(signal_reasons)
        
        return recommendation, round(confidence, 2), signal_text
    
    def get_all_stocks_analysis(self) -> List[Dict]:
        """
        Get analysis for all stocks in the dataset
        
        Returns:
            List of dictionaries with analysis for each stock
        """
        if self.df.empty:
            return []
        
        symbols = self.df['symbol'].unique()
        analysis = []
        
        for symbol in symbols:
            analysis.append(self.get_stock_recommendation(symbol))
        
        return analysis
    
    def get_stock_price_history(self, symbol: str, limit: int = 20) -> List[Dict]:
        """
        Get price history for a stock
        
        Args:
            symbol: Stock symbol
            limit: Number of records to return
            
        Returns:
            List of price data points
        """
        if symbol not in self.df['symbol'].values:
            return []
        
        stock_data = self.df[self.df['symbol'] == symbol].sort_values('timestamp').tail(limit)
        
        return [
            {
                'date': str(row['timestamp'].date()),
                'open': round(row['open'], 2),
                'high': round(row['high'], 2),
                'low': round(row['low'], 2),
                'close': round(row['close'], 2),
                'volume': int(row['volume'])
            }
            for _, row in stock_data.iterrows()
        ]


class PortfolioService:
    """Service for managing user portfolio"""
    
    def __init__(self, csv_path: str):
        self.csv_path = csv_path
        self.df = load_csv_data(csv_path)
        self.portfolios = {}  # In-memory storage (would use DB in production)
    
    def create_portfolio(self, user_id: str) -> Dict:
        """Create a new portfolio for a user"""
        if user_id not in self.portfolios:
            self.portfolios[user_id] = {
                'user_id': user_id,
                'holdings': {},  # {symbol: {'quantity': int, 'buy_price': float}}
                'transactions': [],
                'cash': 100000  # Starting cash
            }
        
        return self.portfolios[user_id]
    
    def get_portfolio(self, user_id: str) -> Dict:
        """Get user's portfolio with current values"""
        if user_id not in self.portfolios:
            self.create_portfolio(user_id)
        
        portfolio = self.portfolios[user_id]
        
        # Calculate current values
        total_invested = 0
        current_value = 0
        
        for symbol, holding in portfolio['holdings'].items():
            quantity = holding['quantity']
            buy_price = holding['buy_price']
            
            # Get current price
            current_price, _ = self._get_current_price(symbol)
            
            total_invested += quantity * buy_price
            current_value += quantity * current_price
        
        profit_loss = current_value - total_invested
        profit_loss_percent = (profit_loss / total_invested * 100) if total_invested > 0 else 0
        
        return {
            'user_id': user_id,
            'total_invested': round(total_invested, 2),
            'current_value': round(current_value, 2),
            'profit_loss': round(profit_loss, 2),
            'profit_loss_percent': round(profit_loss_percent, 2),
            'cash': round(portfolio['cash'], 2),
            'holdings': {
                symbol: {
                    'quantity': holding['quantity'],
                    'buy_price': round(holding['buy_price'], 2),
                    'current_price': round(self._get_current_price(symbol)[0], 2),
                    'value': round(holding['quantity'] * self._get_current_price(symbol)[0], 2)
                }
                for symbol, holding in portfolio['holdings'].items()
            },
            'transaction_count': len(portfolio['transactions'])
        }
    
    def buy_stock(self, user_id: str, symbol: str, quantity: int) -> Dict:
        """
        Buy a stock for the user
        
        Args:
            user_id: User ID
            symbol: Stock symbol
            quantity: Number of shares to buy
            
        Returns:
            Dictionary with transaction details
        """
        if user_id not in self.portfolios:
            self.create_portfolio(user_id)
        
        portfolio = self.portfolios[user_id]
        current_price, date = self._get_current_price(symbol)
        
        if current_price == 0:
            return {
                'success': False,
                'message': f'Stock {symbol} not found',
                'transaction_id': None
            }
        
        total_cost = current_price * quantity
        
        if portfolio['cash'] < total_cost:
            return {
                'success': False,
                'message': f'Insufficient funds. Available: ${portfolio["cash"]:.2f}, Required: ${total_cost:.2f}',
                'transaction_id': None
            }
        
        # Process buy
        portfolio['cash'] -= total_cost
        
        if symbol in portfolio['holdings']:
            # Calculate new average buy price
            old_quantity = portfolio['holdings'][symbol]['quantity']
            old_buy_price = portfolio['holdings'][symbol]['buy_price']
            new_quantity = old_quantity + quantity
            new_buy_price = ((old_quantity * old_buy_price) + (quantity * current_price)) / new_quantity
            
            portfolio['holdings'][symbol] = {
                'quantity': new_quantity,
                'buy_price': new_buy_price
            }
        else:
            portfolio['holdings'][symbol] = {
                'quantity': quantity,
                'buy_price': current_price
            }
        
        # Record transaction
        transaction_id = str(uuid.uuid4())
        portfolio['transactions'].append({
            'id': transaction_id,
            'symbol': symbol,
            'type': 'BUY',
            'quantity': quantity,
            'price': current_price,
            'total': total_cost,
            'date': date
        })
        
        return {
            'success': True,
            'message': f'Successfully bought {quantity} shares of {symbol} at ${current_price:.2f}',
            'transaction_id': transaction_id,
            'price': current_price,
            'total_amount': total_cost
        }
    
    def sell_stock(self, user_id: str, symbol: str, quantity: int) -> Dict:
        """
        Sell a stock for the user
        
        Args:
            user_id: User ID
            symbol: Stock symbol
            quantity: Number of shares to sell
            
        Returns:
            Dictionary with transaction details
        """
        if user_id not in self.portfolios:
            return {
                'success': False,
                'message': 'Portfolio not found',
                'transaction_id': None
            }
        
        portfolio = self.portfolios[user_id]
        
        if symbol not in portfolio['holdings']:
            return {
                'success': False,
                'message': f'You do not own any shares of {symbol}',
                'transaction_id': None
            }
        
        holding = portfolio['holdings'][symbol]
        if holding['quantity'] < quantity:
            return {
                'success': False,
                'message': f'Insufficient shares. You have {holding["quantity"]} shares',
                'transaction_id': None
            }
        
        current_price, date = self._get_current_price(symbol)
        total_proceeds = current_price * quantity
        profit_loss = (current_price - holding['buy_price']) * quantity
        
        # Process sell
        portfolio['cash'] += total_proceeds
        holding['quantity'] -= quantity
        
        if holding['quantity'] == 0:
            del portfolio['holdings'][symbol]
        
        # Record transaction
        transaction_id = str(uuid.uuid4())
        portfolio['transactions'].append({
            'id': transaction_id,
            'symbol': symbol,
            'type': 'SELL',
            'quantity': quantity,
            'price': current_price,
            'total': total_proceeds,
            'profit_loss': profit_loss,
            'date': date
        })
        
        return {
            'success': True,
            'message': f'Successfully sold {quantity} shares of {symbol} at ${current_price:.2f}',
            'transaction_id': transaction_id,
            'price': current_price,
            'total_amount': total_proceeds,
            'profit_loss': profit_loss
        }
    
    def get_transactions(self, user_id: str, limit: int = 50) -> List[Dict]:
        """
        Get transaction history for a user
        
        Args:
            user_id: User ID
            limit: Number of transactions to return
            
        Returns:
            List of transactions
        """
        if user_id not in self.portfolios:
            return []
        
        transactions = self.portfolios[user_id]['transactions']
        return transactions[-limit:]
    
    def _get_current_price(self, symbol: str) -> Tuple[float, str]:
        """Get current price for a symbol"""
        return get_latest_price(self.df, symbol)
