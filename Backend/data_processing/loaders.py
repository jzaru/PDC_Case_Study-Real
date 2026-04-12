"""HIGH-PERFORMANCE stock data loader (optimized for simulation + API speed)"""

import pandas as pd
from pathlib import Path
from utils.path_utils import DataPathResolver
from typing import Dict, List
import logging

logger = logging.getLogger(__name__)

# 🔥 GLOBAL CACHE (shared across entire app)
_DATA_CACHE = None


class StockDataLoader:
    """Load stock market data ONCE and reuse everywhere"""

    DATASETS = {
        'stock_data': 'stock_details_5_years.csv',
    }

    def __init__(self):
        global _DATA_CACHE

        # If already loaded, reuse instantly
        if _DATA_CACHE is not None:
            self.stock_data = _DATA_CACHE["stock_data"]
            self.stocks_list = _DATA_CACHE["stocks_list"]
            self.precomputed = _DATA_CACHE["precomputed"]
            return

        # Otherwise load once
        self.stock_data: Dict[str, dict] = {}
        self.stocks_list: List[Dict] = []
        self.precomputed: Dict[str, dict] = {}

        self._load_and_process()

        # Save to global cache
        _DATA_CACHE = {
            "stock_data": self.stock_data,
            "stocks_list": self.stocks_list,
            "precomputed": self.precomputed
        }

    def _load_and_process(self):
        """Load and preprocess everything ONCE"""
        try:
            path = DataPathResolver.get_csv_path(self.DATASETS['stock_data'])
            df = pd.read_csv(path)

            # Validate schema
            required = ['Date', 'Open', 'High', 'Low', 'Close', 'Volume', 'Company']
            missing = [col for col in required if col not in df.columns]
            if missing:
                raise ValueError(f"Missing columns: {missing}")

            # Convert types (vectorized)
            df['Date'] = pd.to_datetime(df['Date'], errors='coerce')
            numeric_cols = ['Open', 'High', 'Low', 'Close', 'Volume']
            for col in numeric_cols:
                df[col] = pd.to_numeric(df[col], errors='coerce')

            df = df.dropna(subset=required)

            # 🔥 SORT ONCE
            df = df.sort_values(['Company', 'Date'])

            # 🔥 GROUP FAST (no repeated filtering)
            grouped = df.groupby('Company')

            for company, group in grouped:
                group = group.reset_index(drop=True)

                # Convert to FAST structures (not pandas-heavy)
                prices = group['Close'].tolist()
                opens = group['Open'].tolist()
                volumes = group['Volume'].tolist()

                latest_price = prices[-1]
                open_price = opens[-1]
                volume = volumes[-1]

                change = ((latest_price - open_price) / open_price * 100) if open_price != 0 else 0

                # 🔥 Store lightweight structure (FAST access)
                self.stock_data[company] = {
                    "prices": prices,
                    "opens": opens,
                    "volumes": volumes,
                    "length": len(prices)
                }

                # 🔥 Precomputed (used in simulation/API)
                self.precomputed[company] = {
                    "latest_price": latest_price,
                    "change": change,
                    "volume": volume
                }

                self.stocks_list.append({
                    "company": company,
                    "name": company,
                    "current_price": latest_price,
                    "change": change,
                    "volume": volume
                })

            logger.info(f"✓ Loaded {len(self.stock_data)} stocks (OPTIMIZED)")
            print(f"✓ Loaded {len(self.stock_data)} stocks (OPTIMIZED)")

        except Exception as e:
            logger.error(f"✗ Error loading stock data: {e}")
            raise

    # ========================
    # FAST ACCESS METHODS
    # ========================

    def get_stocks_list(self) -> List[Dict]:
        return self.stocks_list

    def get_stock_data(self, company: str):
        return self.stock_data.get(company)

    def get_latest_price(self, company: str) -> float:
        data = self.precomputed.get(company)
        return data["latest_price"] if data else 0.0

    def get_price_at_index(self, company: str, index: int) -> float:
        """🔥 O(1) access for simulation"""
        data = self.stock_data.get(company)
        if not data:
            return 0.0

        index = min(index, data["length"] - 1)
        return data["prices"][index]