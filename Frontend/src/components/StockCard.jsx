import React, { useState, useCallback } from 'react';
import { stockApi } from '../services/api';
import AnalysisModal from './AnalysisModal';

const StockCard = React.memo(function StockCard({ stock, onSelect }) {
  const [showModal, setShowModal] = useState(false);
  const [history, setHistory] = useState([]);

  const handleViewAnalysis = useCallback(async () => {
    try {
      const data = await stockApi.getStockHistory(stock.company);
      setHistory(data.history || []);
      setShowModal(true);
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  }, [stock.company]);

  const handleCloseModal = useCallback(() => setShowModal(false), []);

  // 🔥 Action styling
  const getActionStyles = useCallback(() => {
    switch (stock.action) {
      case 'BUY':
        return {
          bg: 'bg-green-500/20',
          text: 'text-green-400',
          label: 'BUY'
        };
      case 'SELL':
        return {
          bg: 'bg-red-500/20',
          text: 'text-red-400',
          label: 'SELL'
        };
      default:
        return {
          bg: 'bg-gray-500/20',
          text: 'text-gray-400',
          label: 'HOLD'
        };
    }
  }, [stock.action]);

  const actionStyle = getActionStyles();

  // 🔥 ACTION BUTTON LOGIC
  const renderActionButton = useCallback(() => {
    if (stock.action === 'BUY') {
      return (
        <button
          onClick={() => onSelect(stock.company, 'buy')}
          className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg transition-colors"
        >
          Buy Now 🚀
        </button>
      );
    }

    if (stock.action === 'SELL') {
      return (
        <button
          onClick={() => onSelect(stock.company, 'sell')}
          className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg transition-colors"
        >
          Sell Now 📉
        </button>
      );
    }

    return (
      <button
        onClick={() => onSelect(stock.company)}
        className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg transition-colors"
      >
        Hold / View
      </button>
    );
  }, [stock.action, stock.company, onSelect]);

  return (
    <>
      <div className="w-full bg-slate-800 rounded-xl p-4 shadow-lg hover:shadow-xl transition-shadow">

        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-xl font-bold text-white">{stock.company}</h3>
            <p className="text-gray-400 text-sm">Stock Price</p>
          </div>

          <span className="text-2xl font-bold text-green-400">
            ${stock.current_price?.toFixed(2) || 'N/A'}
          </span>
        </div>

        {/* SIGNAL */}
        <div className="flex justify-between items-center mb-4">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${actionStyle.bg} ${actionStyle.text}`}>
            {actionStyle.label}
          </span>

          <span className="text-sm text-white font-medium">
            {stock.confidence?.toFixed(0)}%
          </span>
        </div>

        {/* Buttons */}
        <div className="space-y-2">
          <button
            onClick={handleViewAnalysis}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg transition-colors"
          >
            View Analysis
          </button>

          {renderActionButton()}
        </div>
      </div>

      {showModal && (
        <AnalysisModal
          stock={stock}
          history={history}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
});

export default StockCard;