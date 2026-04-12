import React, { useState } from 'react';
import { stockApi } from '../services/api';
import AnalysisModal from './AnalysisModal';

export default function StockCard({ stock, onSelect }) {
  const [showModal, setShowModal] = useState(false);
  const [history, setHistory] = useState([]);

  const handleViewAnalysis = async () => {
    try {
      const data = await stockApi.getStockHistory(stock.company);
      setHistory(data.history || []);
      setShowModal(true);
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  return (
    <>
      <div className="w-full bg-slate-800 rounded-xl p-4 shadow-lg hover:shadow-xl transition-shadow">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-xl font-bold text-white">{stock.company}</h3>
            <p className="text-gray-400 text-sm">Stock Price</p>
          </div>
          <span className="text-2xl font-bold text-green-400">
            ${stock.current_price?.toFixed(2) || 'N/A'}
          </span>
        </div>

        <div className="space-y-2 mb-4">
          <button
            onClick={handleViewAnalysis}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg transition-colors"
          >
            View Analysis
          </button>
          <button
            onClick={() => onSelect(stock.company)}
            className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg transition-colors"
          >
            Trade
          </button>
        </div>
      </div>

      {showModal && (
        <AnalysisModal
          stock={stock}
          history={history}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
