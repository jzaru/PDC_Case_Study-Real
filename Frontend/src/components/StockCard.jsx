import React, { useEffect, useState } from 'react';
import { stockApi } from '../services/api';

export default function StockCard({ stock, onSelect }) {
  const [expanded, setExpanded] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchAnalysis = async () => {
    if (expanded) {
      setExpanded(false);
      setAnalysis(null);
      return;
    }

    setLoading(true);
    try {
      const data = await stockApi.getStockAnalysis(stock.symbol);
      setAnalysis(data);
      setExpanded(true);
    } catch (error) {
      console.error('Error fetching analysis:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRecommendationColor = (rec) => {
    if (rec === 'BUY') return 'text-green-400';
    if (rec === 'SELL') return 'text-red-400';
    return 'text-yellow-400';
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 shadow-lg hover:shadow-xl transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-xl font-bold text-white">{stock.symbol}</h3>
          <p className="text-gray-400 text-sm">Stock Price</p>
        </div>
        <span className="text-2xl font-bold text-green-400">
          ${stock.current_price?.toFixed(2) || 'N/A'}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <button
          onClick={fetchAnalysis}
          disabled={loading}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg transition-colors disabled:bg-gray-600"
        >
          {loading ? 'Loading...' : 'View Analysis'}
        </button>
        <button
          onClick={() => onSelect(stock.symbol)}
          className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg transition-colors"
        >
          Trade
        </button>
      </div>

      {expanded && analysis && (
        <div className="bg-gray-700 rounded-lg p-4 mt-3 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-300">Current Price:</span>
            <span className="text-white font-semibold">
              ${analysis.current_price.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300">MA10:</span>
            <span className="text-white">${analysis.moving_average_10.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300">MA20:</span>
            <span className="text-white">${analysis.moving_average_20.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300">Volatility:</span>
            <span className="text-white">{analysis.volatility.toFixed(2)}</span>
          </div>
          <div className="border-t border-gray-600 pt-2 mt-2">
            <div className="flex justify-between">
              <span className="text-gray-300">Recommendation:</span>
              <span className={`font-bold ${getRecommendationColor(analysis.recommendation)}`}>
                {analysis.recommendation}
              </span>
            </div>
            <div className="flex justify-between text-xs mt-1">
              <span className="text-gray-400">Confidence:</span>
              <span className="text-gray-300">{(analysis.confidence * 100).toFixed(1)}%</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
