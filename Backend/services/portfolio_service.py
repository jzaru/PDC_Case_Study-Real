"""FAST + SMART Portfolio Service (ML + RISK MANAGEMENT FIXED)"""

from typing import List, Dict, Any
import logging
import json
import os
import asyncio
import numpy as np
from .transaction_service import TransactionService
from .stock_service import StockService

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

BALANCE_FILE = os.path.join(os.path.dirname(__file__), '..', 'data', 'balance.json')
SIMULATION_FILE = os.path.join(os.path.dirname(__file__), '..', 'data', 'simulation.json')


class PortfolioService:

    def __init__(self, stock_service: StockService, transaction_service: TransactionService):
        self.stock_service = stock_service
        self.transaction_service = transaction_service

        self.balance = self._load_balance()

        self.simulation_running = False
        self.simulation_index = 0
        self.simulation_task = None

        self._load_simulation_state()

    # ========================
    # BALANCE
    # ========================

    def _load_balance(self):
        try:
            if os.path.exists(BALANCE_FILE):
                with open(BALANCE_FILE, 'r') as f:
                    return json.load(f).get('balance', 10000.0)
        except Exception as e:
            logger.error(e)
        return 10000.0

    def _save_balance(self):
        os.makedirs(os.path.dirname(BALANCE_FILE), exist_ok=True)
        with open(BALANCE_FILE, 'w') as f:
            json.dump({'balance': self.balance}, f)

    def get_balance(self):
        return self.balance

    def add_balance(self, amount):
        if amount <= 0:
            return {'success': False, 'message': 'Invalid amount'}

        self.balance += amount
        self._save_balance()

        return {'success': True, 'balance': self.balance}

    def subtract_balance(self, amount):
        if amount <= 0 or amount > self.balance:
            return {'success': False, 'message': 'Invalid amount'}

        self.balance -= amount
        self._save_balance()

        return {'success': True, 'balance': self.balance}

    # ========================
    # PRICE
    # ========================

    def _get_price(self, company):
        try:
            if self.simulation_running:
                return self.stock_service.get_price_at_index(company, self.simulation_index)

            data = self.stock_service.loader.stock_data.get(company)
            if not data:
                return 0

            return data["prices"][-1]

        except Exception as e:
            logger.error(f"Price error: {e}")
            return 0

    # ========================
    # BUY / SELL
    # ========================

    def buy_stock(self, company, quantity):
        if quantity <= 0:
            return {'success': False, 'message': 'Invalid quantity'}

        price = self._get_price(company)
        total = price * quantity

        if total > self.balance:
            return {'success': False, 'message': 'Insufficient funds'}

        tx = self.transaction_service.buy_stock(company, quantity, price)

        self.balance -= total
        self._save_balance()

        return {'success': True, 'transaction': tx}

    def sell_stock(self, company, quantity):
        transactions = self.transaction_service.get_transactions()

        shares = 0
        for tx in transactions:
            if tx['company'] == company:
                shares += tx['quantity'] if tx['type'] == 'buy' else -tx['quantity']

        if shares < quantity:
            return {'success': False, 'message': 'Not enough shares'}

        price = self._get_price(company)
        total = price * quantity

        tx = self.transaction_service.sell_stock(company, quantity, price)

        self.balance += total
        self._save_balance()

        return {'success': True, 'transaction': tx}

    # ========================
    # PORTFOLIO (🔥 FIXED WITH RISK LOGIC)
    # ========================

    def get_portfolio(self):
        holdings = self._compute_holdings()
        total_value = sum(h['value'] for h in holdings)

        # 🔥 FIX: Convert to ensure JSON serialization
        portfolio = {
            'holdings': holdings,
            'cash': float(self.balance),
            'portfolio_value': float(total_value + self.balance)
        }
        return to_python(portfolio)

    def _compute_holdings(self):
        transactions = self.transaction_service.get_transactions()
        data = {}

        for tx in transactions:
            c = tx['company']
            if c not in data:
                data[c] = {'shares': 0, 'cost': 0}

            if tx['type'] == 'buy':
                data[c]['shares'] += tx['quantity']
                data[c]['cost'] += tx['price'] * tx['quantity']
            else:
                data[c]['shares'] -= tx['quantity']

        result = []

        for company, d in data.items():
            if d['shares'] <= 0:
                continue

            stock_data = self.stock_service.get_single_stock(
                company,
                index=self.simulation_index if self.simulation_running else None
            )

            if not stock_data:
                continue

            price = stock_data["price"]
            avg_buy_price = d['cost'] / d['shares']

            profit_percent = ((price - avg_buy_price) / avg_buy_price) * 100

            ml_action = stock_data["action"]
            confidence = stock_data["confidence"]

            # 🔥 SMART DECISION LAYER
            if profit_percent < -2 and confidence < 75:
                action = "SELL"  # stop loss

            elif profit_percent > 3:
                action = "SELL"  # take profit

            else:
                action = ml_action  # fallback to ML

            result.append({
                'company': company,
                'shares': d['shares'],
                'current_price': price,
                'value': d['shares'] * price,
                'cost': d['cost'],
                'profit_percent': round(profit_percent, 2),
                'confidence': confidence,
                'action': action
            })

        return result

    # ========================
    # SIMULATION
    # ========================

    def _load_simulation_state(self):
        try:
            if os.path.exists(SIMULATION_FILE):
                with open(SIMULATION_FILE, 'r') as f:
                    data = json.load(f)
                    self.simulation_index = data.get('index', 0)
                    self.simulation_running = data.get('running', False)
        except:
            pass

    def start_simulation(self):
        if self.simulation_running:
            return {'success': False}

        self.simulation_running = True
        self.simulation_task = asyncio.create_task(self._run())

        return {'success': True}

    def stop_simulation(self):
        self.simulation_running = False
        if self.simulation_task:
            self.simulation_task.cancel()
        return {'success': True}

    def get_simulation_status(self):
        return {
            'running': self.simulation_running,
            'current_index': self.simulation_index
        }

    async def _run(self):
        try:
            while self.simulation_running:
                self.simulation_index += 1
                await asyncio.sleep(2)
        except:
            pass