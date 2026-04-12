"""Transaction service for handling buy/sell operations"""

from typing import List, Dict, Any
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

class TransactionService:
    """Service for managing transactions"""

    def __init__(self):
        # In-memory storage for transactions
        self.transactions: List[Dict[str, Any]] = []

    def buy_stock(self, company: str, quantity: int, price: float) -> Dict[str, Any]:
        """Record a buy transaction"""
        transaction = {
            'id': len(self.transactions) + 1,
            'company': company,
            'type': 'buy',
            'price': price,
            'quantity': quantity,
            'date': datetime.now().isoformat()
        }
        self.transactions.append(transaction)
        return transaction

    def sell_stock(self, company: str, quantity: int, price: float) -> Dict[str, Any]:
        """Record a sell transaction"""
        transaction = {
            'id': len(self.transactions) + 1,
            'company': company,
            'type': 'sell',
            'price': price,
            'quantity': quantity,
            'date': datetime.now().isoformat()
        }
        self.transactions.append(transaction)
        return transaction

    def get_transactions(self) -> List[Dict[str, Any]]:
        """Get all transactions"""
        return self.transactions