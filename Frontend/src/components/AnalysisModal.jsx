import React, { useState, useEffect } from 'react';
import StockChart from '../charts/StockChart';

export default function AnalysisModal({ stock, history, onClose }) {
  // 🔥 NEW FEATURE: State additions
  const [predictionTime, setPredictionTime] = useState(null);
  const [loadingPrediction, setLoadingPrediction] = useState(true);
  const [enhancedMessage, setEnhancedMessage] = useState('');
  const [timeBasedInsight, setTimeBasedInsight] = useState('');

  // Dynamic analysis data
  const confidence = Math.floor(Math.random() * 40) + 60; // 60-100%
  const recommendation = confidence > 70 ? 'BUY' : confidence > 50 ? 'HOLD' : 'SELL';

  // 🔥 NEW FEATURE: Smart Recommendation Text
  useEffect(() => {
    let message = '';
    if (recommendation === 'BUY') {
      message = confidence > 80
        ? 'Strong upward trend. Consider buying now.'
        : 'Uptrend detected, but consider waiting for a better entry.';
    } else if (recommendation === 'SELL') {
      message = confidence > 80
        ? 'Strong downward signal. Consider selling soon.'
        : 'Possible decline. Monitor before selling.';
    } else {
      message = 'Market is uncertain. Wait for clearer signals.';
    }
    setEnhancedMessage(message);
  }, [recommendation, confidence]);

  // 🔥 NEW FEATURE: Time-Based Insight
  useEffect(() => {
    let insight = '';
    if (confidence > 85) {
      insight = 'Momentum increasing — entry window soon';
    } else if (confidence > 70) {
      insight = 'Short-term dip expected before rise';
    } else if (confidence > 60) {
      insight = 'Volatility detected — avoid immediate action';
    } else {
      insight = 'High uncertainty — wait for clearer signals';
    }
    setTimeBasedInsight(insight);
  }, [confidence]);

  // 🔥 NEW FEATURE: Prediction Time and Loading State
  useEffect(() => {
    const fetchPrediction = async () => {
      setLoadingPrediction(true);
      const startTime = performance.now();
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 200));
      const endTime = performance.now();
      setPredictionTime((endTime - startTime).toFixed(2));
      setLoadingPrediction(false);
    };
    fetchPrediction();
  }, []);

  const prediction = enhancedMessage;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-slate-800 text-white rounded-xl shadow-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl"
        >
          ✕
        </button>

        <div className="pr-8">
          <h2 className="text-2xl font-bold mb-6">
            📊 {stock.company} Analysis
          </h2>

          <div className="space-y-6">
            {/* Chart */}
            <div className="bg-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-2">Price Chart</h3>
              {history && history.length > 0 ? (
                <StockChart data={history} symbol={stock.company} />
              ) : (
                <p className="text-gray-400">No chart data available</p>
              )}
            </div>

            {/* 🔥 NEW FEATURE: UI Improvement - Stat Card Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-900 rounded-lg p-4 text-center">
                <h3 className="text-sm font-semibold text-green-300 mb-1">
                  📊 Confidence
                </h3>
                <div className="text-2xl font-bold text-green-400">
                  {confidence}%
                </div>
                <div className="w-full bg-gray-600 rounded-full h-2 mt-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${confidence}%` }}
                  ></div>
                </div>
              </div>

              <div className="bg-blue-900 rounded-lg p-4 text-center">
                <h3 className="text-sm font-semibold text-blue-300 mb-1">
                  ⏱ Prediction Time
                </h3>
                <div className="text-2xl font-bold text-blue-400">
                  {loadingPrediction ? '...' : `${predictionTime} ms`}
                </div>
              </div>

              <div className="bg-purple-900 rounded-lg p-4 text-center">
                <h3 className="text-sm font-semibold text-purple-300 mb-1">
                  ⚡ Signal Strength
                </h3>
                <div className={`text-2xl font-bold ${
                  recommendation === 'BUY' ? 'text-green-400' :
                  recommendation === 'SELL' ? 'text-red-400' : 'text-gray-400'
                }`}>
                  {recommendation}
                </div>
              </div>
            </div>

            {/* 🔥 NEW FEATURE: Loading State */}
            {loadingPrediction && (
              <div className="bg-gray-700 rounded-lg p-4 text-center">
                <div className="animate-pulse text-gray-400">
                  Analyzing stock...
                </div>
                <div className="mt-2 flex justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                </div>
              </div>
            )}

            {/* Prediction */}
            {!loadingPrediction && (
              <div className="bg-yellow-900 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-yellow-300 mb-2">
                  📅 Price Prediction
                </h3>
                <p className="text-gray-200 mb-2">
                  {prediction}
                </p>
                <p className="text-sm text-gray-400 mb-2">
                  💡 {timeBasedInsight}
                </p>
                <p className="text-sm text-gray-400">
                  Recommended: {recommendation === 'BUY' ? 'Buy now' : recommendation === 'SELL' ? 'Sell soon' : 'Hold position'} if confidence {" > "} 70%.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}