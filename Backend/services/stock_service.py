"""HIGH-PERFORMANCE stock service (simulation-aware + stable)"""

from typing import List, Dict, Any
from data_processing.loaders import StockDataLoader
import logging

logger = logging.getLogger(__name__)


class StockService:
    """Ultra-fast stock service"""

    def __init__(self, loader: StockDataLoader):
        self.loader = loader

        # Cached data
        self.stocks = self.loader.get_stocks_list()
        self.data = self.loader.stock_data

    # ========================
    # ANALYSIS (FAST)
    # ========================

    def analyze_prices(self, prices: List[float]) -> Dict[str, Any]:
        if len(prices) < 5:
            return {"confidence": 50.0, "action": "HOLD"}

        recent = prices[-5:]
        trend = recent[-1] - recent[0]
        avg_price = sum(recent) / len(recent)

        confidence = min(max((abs(trend) / avg_price) * 100, 0), 100)

        if trend > 0 and confidence > 70:
            action = "BUY"
        elif trend < 0 and confidence > 60:
            action = "SELL"
        else:
            action = "HOLD"

        return {
            "confidence": round(confidence, 2),
            "action": action
        }

    # ========================
    # CORE API METHODS
    # ========================

    def get_all_stocks(self, index: int = None) -> List[Dict[str, Any]]:
        """
        🔥 Simulation-aware stock list
        """

        result = []

        for stock in self.stocks:
            company = stock["company"]
            data = self.data.get(company)

            if not data:
                continue

            prices = data["prices"]
            length = data["length"]

            # 🔥 ALWAYS safe index handling
            if index is not None:
                idx = min(max(index, 0), length - 1)
            else:
                idx = length - 1  # fallback

            current_price = prices[idx]

            # 🔥 analysis window (last 5 from index)
            start = max(0, idx - 5)
            relevant_prices = prices[start:idx + 1]

            analysis = self.analyze_prices(relevant_prices)

            result.append({
                "company": company,
                "name": stock["name"],
                "price": round(current_price, 2),
                "confidence": analysis["confidence"],
                "action": analysis["action"]
            })

        return result

    def get_stock_history(self, company: str, limit: int = 100, index: int = None) -> List[Dict[str, Any]]:
        """
        🔥 Simulation-aware history
        """

        data = self.data.get(company)
        if not data:
            return []

        prices = data["prices"]
        length = data["length"]

        # 🔥 respect simulation index
        if index is not None:
            end = min(index, length - 1)
        else:
            end = length - 1

        start = max(0, end - limit)

        return [
            {
                "index": i,
                "close": prices[i]
            }
            for i in range(start, end + 1)
        ]

    def get_price_at_index(self, company: str, index: int) -> float:
        return self.loader.get_price_at_index(company, index)