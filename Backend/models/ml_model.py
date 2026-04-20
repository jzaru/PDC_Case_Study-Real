import numpy as np
from sklearn.ensemble import RandomForestClassifier
import logging
import time

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


class StockMLModel:
    """ADVANCED ML model with HIGH-CONFIDENCE prediction system"""

    def __init__(self):
        # 🔥 STRONGER MODEL
        self.model = RandomForestClassifier(
            n_estimators=150,
            max_depth=10,
            min_samples_split=5,
            random_state=42
        )

        self.trained = False

        # 🔥 TRAINING MODE
        self.use_full_data = False

        # 🔥 training time
        self.training_time = 0.0

    # ========================
    # MODE CONTROL
    # ========================

    def set_training_mode(self, full: bool):
        self.use_full_data = full
        mode = "FULL DATA" if full else "FAST MODE"
        logger.info(f"⚡ Training mode set to: {mode}")

    def get_training_mode(self):
        return "FULL" if self.use_full_data else "FAST"

    # ========================
    # 🔥 IMPROVED FEATURE ENGINEERING
    # ========================

    def create_features(self, prices):
        prices = np.array(prices)

        if len(prices) < 10:
            prices = np.pad(prices, (10 - len(prices), 0), mode='edge')

        return [
            prices[-1],

            # basic returns
            (prices[-1] - prices[-2]) / (prices[-2] + 1e-6),
            (prices[-1] - prices[-5]) / (prices[-5] + 1e-6),

            # averages
            np.mean(prices[-5:]),
            np.mean(prices[-10:]),

            # volatility
            np.std(prices[-5:]),

            # 🔥 NEW FEATURES (IMPORTANT)
            np.max(prices[-10:]),   # resistance
            np.min(prices[-10:]),   # support
            prices[-1] / (np.mean(prices[-10:]) + 1e-6),  # momentum ratio
        ]

    # ========================
    # TRAINING
    # ========================

    def train(self, dataset):
        start_time = time.time()

        X = []
        y = []

        MAX_SAMPLES = 3000

        for company, data in dataset.items():
            prices = data["prices"]

            if self.use_full_data:
                end_range = len(prices) - 5
            else:
                end_range = min(len(prices) - 5, 100)

            for i in range(10, end_range):
                window = prices[:i]
                features = self.create_features(window)

                future = prices[i + 5] - prices[i]

                if future > 0:
                    label = 1
                elif future < 0:
                    label = -1
                else:
                    label = 0

                X.append(features)
                y.append(label)

                if not self.use_full_data and len(X) >= MAX_SAMPLES:
                    break

            if not self.use_full_data and len(X) >= MAX_SAMPLES:
                break

        if X:
            self.model.fit(X, y)
            self.trained = True

            self.training_time = round(time.time() - start_time, 4)

            logger.info(f"✅ ML trained on {len(X)} samples")
            logger.info(f"⏱ Training Time: {self.training_time}s")
            logger.info(f"⚙ Mode: {self.get_training_mode()}")

    # ========================
    # GET TRAINING TIME
    # ========================

    def get_training_time(self):
        return self.training_time

    # ========================
    # 🔥 HIGH-CONFIDENCE PREDICTION
    # ========================

    def predict(self, prices, owns_stock=False):
        if not self.trained:
            return {"action": "HOLD", "confidence": 50.0, "signal_strength": "WEAK", "trend_direction": "FLAT", "peak_detected": False}

        try:
            features = self.create_features(prices)

            probs = self.model.predict_proba([features])[0]
            classes = self.model.classes_

            sorted_idx = np.argsort(probs)[::-1]
            best_idx = sorted_idx[0]
            second_idx = sorted_idx[1]

            best_class = classes[best_idx]
            best_prob = probs[best_idx]
            second_prob = probs[second_idx]

            confidence = float(best_prob * 100)
            margin = best_prob - second_prob

            action_map = {
                1: "BUY",
                -1: "SELL",
                0: "HOLD"
            }

            raw_action = action_map.get(best_class, "HOLD")

            # ========================
            # 🔥 STRICT DECISION SYSTEM
            # ========================

            if confidence >= 90 and margin > 0.2:
                action = raw_action
                signal_strength = "STRONG"

            elif confidence >= 75 and margin > 0.1:
                action = raw_action
                signal_strength = "MEDIUM"

            else:
                action = "HOLD"
                signal_strength = "WEAK"

            # 🔥 NEW: Peak Detection
            peak_detected = self._detect_peak(prices)
            trend_direction = self._get_trend_direction(prices)

            # 🔥 NEW: Peak-Aware Sell Recommendation
            if peak_detected and owns_stock and action != "SELL":
                action = "SELL"
                signal_strength = "STRONG"  # Override to strong sell signal

            # 🔥 FIX: Convert entire response to Python types
            result = {
                "action": action,
                "confidence": float(round(confidence, 2)),
                "signal_strength": signal_strength,
                "trend_direction": trend_direction,
                "peak_detected": bool(peak_detected)
            }
            return to_python(result)

        except Exception as e:
            logger.error(f"Prediction error: {e}")
            return {"action": "HOLD", "confidence": 50.0, "signal_strength": "WEAK", "trend_direction": "FLAT", "peak_detected": False}

    # 🔥 NEW: Peak Detection Heuristic
    def _detect_peak(self, prices):
        if len(prices) < 10:
            return False

        recent_prices = prices[-10:]
        current_price = recent_prices[-1]
        recent_max = np.max(recent_prices)

        # 🔥 FIX: Convert NumPy bool to Python bool
        # Check if current price is near recent max (within 2-3%)
        near_peak = bool((current_price / recent_max) >= 0.97)

        # Check if trend is flattening or turning down
        if len(recent_prices) >= 5:
            recent_trend = np.polyfit(range(5), recent_prices[-5:], 1)[0]
            flattening = bool(abs(recent_trend) < 0.001)  # Very small slope
        else:
            flattening = False

        return near_peak and flattening

    # 🔥 NEW: Trend Direction
    def _get_trend_direction(self, prices):
        if len(prices) < 5:
            return "FLAT"

        recent_prices = prices[-5:]
        slope = np.polyfit(range(5), recent_prices, 1)[0]

        if slope > 0.01:
            return "UP"
        elif slope < -0.01:
            return "DOWN"
        else:
            return "FLAT"