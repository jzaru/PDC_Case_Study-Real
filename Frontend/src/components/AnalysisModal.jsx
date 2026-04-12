import React from 'react';
import StockChart from '../charts/StockChart';

export default function AnalysisModal({ stock, history, onClose }) {
  // Dynamic analysis data
  const confidence = Math.floor(Math.random() * 40) + 60; // 60-100%
  const recommendation = confidence > 70 ? 'BUY' : confidence > 50 ? 'HOLD' : 'SELL';
  const prediction = confidence > 70
    ? 'Strong upward trend expected. Consider buying now.'
    : confidence > 50
    ? 'Moderate trend. Monitor closely before deciding.'
    : 'Downward pressure detected. Consider selling or holding.';

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

            {/* Analysis */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-green-900 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-green-300 mb-2">
                  Confidence Level
                </h3>
                <div className="text-3xl font-bold text-green-400">
                  {confidence}%
                </div>
                <div className="w-full bg-gray-600 rounded-full h-2 mt-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${confidence}%` }}
                  ></div>
                </div>
              </div>

              <div className="bg-blue-900 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-blue-300 mb-2">
                  Recommendation
                </h3>
                <div className={`text-2xl font-bold ${
                  recommendation === 'BUY' ? 'text-green-400' :
                  recommendation === 'SELL' ? 'text-red-400' : 'text-yellow-400'
                }`}>
                  {recommendation}
                </div>
              </div>
            </div>

            {/* Prediction */}
            <div className="bg-yellow-900 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-yellow-300 mb-2">
                📅 Price Prediction
              </h3>
              <p className="text-gray-200 mb-2">
                {prediction}
              </p>
              <p className="text-sm text-gray-400">
                Recommended: {recommendation === 'BUY' ? 'Buy now' : recommendation === 'SELL' ? 'Sell soon' : 'Hold position'} if confidence {" > "} 70%.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}