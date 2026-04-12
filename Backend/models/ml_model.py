import numpy as np
from sklearn.ensemble import RandomForestClassifier
import logging

logger = logging.getLogger(__name__)


class StockMLModel:
    """FAST + SAFE ML model with BALANCED decision logic"""

    def __init__(self):
        self.model = RandomForestClassifier(
            n_estimators=30,
            max_depth=4,
            random_state=42
        )
        self.trained = False

    # ========================
    # FEATURE ENGINEERING
    # ========================

    def create_features(self, prices):
        prices = np.array(prices)

        if len(prices) < 10:
            prices = np.pad(prices, (10 - len(prices), 0), mode='edge')

        return [
            prices[-1],
            (prices[-1] - prices[-2]) / (prices[-2] + 1e-6),
            (prices[-1] - prices[-5]) / (prices[-5] + 1e-6),
            np.mean(prices[-5:]),
            np.mean(prices[-10:]),
            np.std(prices[-5:])
        ]

    # ========================
    # TRAINING (LIMITED)
    # ========================

    def train(self, dataset):
        X = []
        y = []

        MAX_SAMPLES = 3000

        for company, data in dataset.items():
            prices = data["prices"]

            for i in range(10, min(len(prices) - 5, 100)):
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

                if len(X) >= MAX_SAMPLES:
                    break

            if len(X) >= MAX_SAMPLES:
                break

        if X:
            self.model.fit(X, y)
            self.trained = True
            logger.info(f"✅ ML trained on {len(X)} samples")

    # ========================
    # PREDICTION (BALANCED + REALISTIC)
    # ========================

    def predict(self, prices):
        if not self.trained:
            return {"action": "HOLD", "confidence": 50.0}

        try:
            features = self.create_features(prices)

            probs = self.model.predict_proba([features])[0]
            classes = self.model.classes_

            # Get sorted probabilities
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
            # 🔥 FINAL DECISION SYSTEM
            # ========================

            # Base filters (apply to ALL)
            if confidence < 65:
                action = "HOLD"

            elif margin < 0.15:
                action = "HOLD"

            # Strong BUY condition
            elif raw_action == "BUY" and confidence >= 70:
                action = "BUY"

            # Strong SELL condition (MATCH BUY strictness)
            elif raw_action == "SELL" and confidence >= 70:
                action = "SELL"

            # Everything else
            else:
                action = "HOLD"

            return {
                "action": action,
                "confidence": round(confidence, 2)
            }

        except Exception as e:
            logger.error(f"Prediction error: {e}")
            return {"action": "HOLD", "confidence": 50.0}