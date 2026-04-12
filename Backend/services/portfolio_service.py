"""FAST + FIXED Portfolio Service (NO PERFORMANCE REGRESSION)"""

from typing import List, Dict, Any
import logging
import json
import os
import asyncio
from .transaction_service import TransactionService
from .stock_service import StockService

logger = logging.getLogger(__name__)

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
    # BALANCE (FIXED RESPONSE)
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

        return {
            'success': True,
            'balance': self.balance  # 🔥 FIXED
        }

    def subtract_balance(self, amount):
        if amount <= 0 or amount > self.balance:
            return {'success': False, 'message': 'Invalid amount'}

        self.balance -= amount
        self._save_balance()

        return {
            'success': True,
            'balance': self.balance  # 🔥 FIXED
        }

    # ========================
    # PRICE (FAST + SAFE)
    # ========================

    def _get_price(self, company):
        try:
            if self.simulation_running:
                price = self.stock_service.get_price_at_index(company, self.simulation_index)
            else:
                data = self.stock_service.loader.stock_data.get(company)
                if not data:
                    return 0
                price = data["prices"][-1]

            return float(price) if price else 0

        except Exception as e:
            logger.error(f"Price error: {e}")
            return 0

    # ========================
    # BUY / SELL (OPTIMIZED)
    # ========================

    def buy_stock(self, company, quantity):
        if quantity <= 0:
            return {'success': False, 'message': 'Invalid quantity'}

        price = self._get_price(company)

        if price <= 0:
            return {'success': False, 'message': 'Invalid stock price'}

        total = price * quantity

        if total > self.balance:
            return {'success': False, 'message': 'Insufficient funds'}

        tx = self.transaction_service.buy_stock(company, quantity, price)

        self.balance -= total
        self._save_balance()

        return {'success': True, 'transaction': tx}

    def sell_stock(self, company, quantity):
        if quantity <= 0:
            return {'success': False, 'message': 'Invalid quantity'}

        # 🔥 FAST SHARE CHECK (NO HEAVY COMPUTE)
        transactions = self.transaction_service.get_transactions()
        shares = 0

        for tx in transactions:
            if tx['company'] == company:
                if tx['type'] == 'buy':
                    shares += tx['quantity']
                else:
                    shares -= tx['quantity']

        if shares < quantity:
            return {'success': False, 'message': 'Not enough shares'}

        price = self._get_price(company)

        if price <= 0:
            return {'success': False, 'message': 'Invalid stock price'}

        total = price * quantity

        tx = self.transaction_service.sell_stock(company, quantity, price)

        self.balance += total
        self._save_balance()

        return {'success': True, 'transaction': tx}

    # ========================
    # PORTFOLIO
    # ========================

    def get_portfolio(self):
        holdings = self._compute_holdings()
        total_value = sum(h['value'] for h in holdings)

        return {
            'holdings': holdings,
            'cash': self.balance,
            'portfolio_value': total_value + self.balance
        }

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

            price = self._get_price(company)

            result.append({
                'company': company,
                'shares': d['shares'],
                'current_price': price,
                'value': d['shares'] * price,
                'cost': d['cost']
            })

        return result

    # ========================
    # SIMULATION (LIGHT)
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

    def _save_simulation_state(self):
        os.makedirs(os.path.dirname(SIMULATION_FILE), exist_ok=True)
        with open(SIMULATION_FILE, 'w') as f:
            json.dump({
                'index': self.simulation_index,
                'running': self.simulation_running
            }, f)

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