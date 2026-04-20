"""ULTRA LOW LATENCY + REALISTIC stock service (CACHED + REAL ML)"""

from typing import List, Dict, Any
from data_processing.loaders import StockDataLoader
from models.ml_model import StockMLModel
import logging
import time
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


class StockService:
    """Ultra-fast stock service with caching (REALISTIC + OPTIMIZED)"""

    def __init__(self, loader: StockDataLoader):
        self.loader = loader

        self.stocks = self.loader.get_stocks_list()
        self.data = self.loader.stock_data

        self.workers = 4

        self.model = StockMLModel()
        self.training_mode = "FAST"

        # 🔥 CACHE SYSTEM
        self.cache = None
        self.cache_time = 0
        self.cache_ttl = 0.5  # seconds

        self._train_model()

    # ========================
    # TRAINING CONTROL
    # ========================

    def _train_model(self):
        try:
            self.model.train(self.data)
            logger.info(f"✅ ML model trained ({self.training_mode})")
        except Exception as e:
            logger.error(f"ML training failed: {e}")

    def set_training_mode(self, mode: str):
        try:
            mode = mode.upper()

            if mode not in ["FAST", "FULL"]:
                return {"error": "Invalid mode"}

            self.training_mode = mode

            self.model.set_training_mode(mode == "FULL")
            self._train_model()

            # 🔥 invalidate cache after retrain
            self.cache = None

            logger.info(f"⚡ Training mode switched → {mode}")

            return {
                "success": True,
                "mode": mode,
                "training_time": self.model.get_training_time()
            }

        except Exception as e:
            logger.error(f"Training mode error: {e}")
            return {"error": str(e)}

    def get_training_mode(self):
        return {
            "mode": self.training_mode,
            "training_time": self.model.get_training_time()
        }

    # ========================
    # WORKER CONTROL (UI ONLY)
    # ========================

    def set_workers(self, workers: int):
        try:
            workers = int(workers)
            if workers <= 0:
                workers = 1
            self.workers = workers
            logger.info(f"⚡ Workers updated → {self.workers}")
        except Exception as e:
            logger.error(f"Invalid workers value: {e}")

    def get_workers(self) -> int:
        return self.workers

    # ========================
    # INTERNAL
    # ========================

    def _get_index(self, index, length):
        if index is not None:
            return min(max(index, 0), length - 1)
        return length - 1

    # ========================
    # 🔥 REAL COMPUTATION
    # ========================

    def _compute_all_stocks(self, index):
        results = []

        for stock in self.stocks:
            try:
                company = stock["company"]
                data = self.data.get(company)

                if not data:
                    continue

                prices = data["prices"]
                length = data["length"]

                idx = self._get_index(index, length)
                current_price = prices[idx]

                start = max(0, idx - 10)
                relevant_prices = prices[start:idx + 1]

                analysis = self.model.predict(relevant_prices, owns_stock=False)

                # 🔥 FIX: Convert all values to Python types before appending
                stock_result = {
                    "company": str(company),
                    "name": str(stock["name"]),
                    "price": float(round(current_price, 2)),
                    "confidence": float(analysis["confidence"]),
                    "action": str(analysis["action"]),
                    "signal_strength": str(analysis.get("signal_strength", "WEAK")),
                    "trend_direction": str(analysis.get("trend_direction", "FLAT")),
                    "peak_detected": bool(analysis.get("peak_detected", False))
                }
                results.append(to_python(stock_result))

            except Exception as e:
                logger.error(f"Error processing stock {stock}: {e}")

        return results

    # ========================
    # 🚀 ULTRA FAST API
    # ========================

    def get_all_stocks(self, index: int = None) -> List[Dict[str, Any]]:
        now = time.time()

        # 🔥 RETURN CACHE IF FRESH
        if self.cache and (now - self.cache_time < self.cache_ttl):
            return self.cache

        # 🔥 COMPUTE ONLY WHEN NEEDED
        results = self._compute_all_stocks(index)

        # 🔥 SAVE CACHE
        self.cache = results
        self.cache_time = now

        return results

    # ========================
    # SINGLE STOCK (CACHE AWARE)
    # ========================

    def get_single_stock(self, company: str, index: int = None):
        # 🔥 try cache first
        if self.cache:
            for stock in self.cache:
                if stock["company"] == company:
                    return stock

        # fallback (rare)
        data = self.data.get(company)
        if not data:
            return None

        prices = data["prices"]
        length = data["length"]

        idx = self._get_index(index, length)

        start = max(0, idx - 10)
        relevant_prices = prices[start:idx + 1]

        # 🔥 FIX: Convert prediction result to Python types
        prediction = self.model.predict(relevant_prices, owns_stock=False)
        return to_python(prediction)

    # ========================
    # HISTORY
    # ========================

    def get_stock_history(self, company: str, limit: int = 100, index: int = None):
        data = self.data.get(company)
        if not data:
            return []

        prices = data["prices"]
        length = data["length"]

        end = self._get_index(index, length)
        start = max(0, end - limit)

        return [
            {"index": i, "close": prices[i]}
            for i in range(start, end + 1)
        ]

    # ========================
    # PRICE
    # ========================

    def get_price_at_index(self, company: str, index: int) -> float:
        return self.loader.get_price_at_index(company, index)