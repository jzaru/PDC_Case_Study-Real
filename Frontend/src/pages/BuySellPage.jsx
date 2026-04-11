import React, { useEffect, useState } from 'react';
import { stockApi, portfolioApi } from '../services/api';
import StockChart from '../charts/StockChart';

export default function BuySellPage({ selectedSymbol, userId }) {
  const [symbol, setSymbol] = useState(selectedSymbol || 'AAPL');
  const [quantity, setQuantity] = useState(1);
  const [analysis, setAnalysis] = useState(null);
  const [history, setHistory] = useState([]);
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [transactionType, setTransactionType] = useState('buy');
  const [availableStocks, setAvailableStocks] = useState([]);

  useEffect(() => {
    setSymbol(selectedSymbol || 'AAPL');
  }, [selectedSymbol]);

  useEffect(() => {
    fetchStocks();
  }, []);

  useEffect(() => {
    fetchData();
  }, [symbol, userId]);

  const fetchStocks = async () => {
    try {
      const stocks = await stockApi.getAllStocks();
      setAvailableStocks(stocks);
    } catch (error) {
      console.error('Error fetching stocks:', error);
    }
  };

  const fetchData = async () => {
    console.log('BuySellPage: Fetching data for', symbol);
    setLoading(true);
    try {
      const [analysisData, historyData, portfolioData] = await Promise.all([
        stockApi.getStockAnalysis(symbol),
        stockApi.getStockHistory(symbol),
        portfolioApi.getPortfolio(userId),
      ]);
      console.log('BuySellPage: Data fetched', { analysisData, historyData, portfolioData });
      setAnalysis(analysisData);
      setHistory(historyData.history || []);
      setPortfolio(portfolioData);
    } catch (error) {
      console.error('BuySellPage: Error fetching data:', error);
      setMessage({ type: 'error', text: 'Failed to load data' });
    } finally {
      setLoading(false);
    }
  };

  const handleBuy = async () => {
    if (quantity <= 0) {
      setMessage({ type: 'error', text: 'Quantity must be greater than 0' });
      return;
    }

    try {
      const result = await portfolioApi.buyStock(userId, symbol, parseInt(quantity));
      if (result.success) {
        setMessage({
          type: 'success',
          text: `✓ Bought ${quantity} shares of ${symbol}`,
        });
        setQuantity(1);
        fetchData();
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Transaction failed' });
      console.error(error);
    }
  };

  const handleSell = async () => {
    if (quantity <= 0) {
      setMessage({ type: 'error', text: 'Quantity must be greater than 0' });
      return;
    }

    try {
      const result = await portfolioApi.sellStock(userId, symbol, parseInt(quantity));
      if (result.success) {
        setMessage({
          type: 'success',
          text: `✓ Sold ${quantity} shares of ${symbol}`,
        });
        setQuantity(1);
        fetchData();
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Transaction failed' });
      console.error(error);
    }
  };

  const holding = portfolio?.holdings[symbol];
  const currentPrice = analysis?.current_price || 0;
  const currentValue = currentPrice * quantity;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-white mb-8">💰 Buy / Sell Stocks</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2">
          {loading ? (
            <div className="bg-gray-800 rounded-lg p-6 text-center text-gray-400">
              Loading chart data...
            </div>
          ) : history.length > 0 ? (
            <StockChart data={history} symbol={symbol} />
          ) : (
            <div className="bg-gray-800 rounded-lg p-6 text-center text-gray-400">
              No chart data available for {symbol}
            </div>
          )}
        </div>

        {/* Trade Panel */}
        <div>
          <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
            {/* Stock Selector */}
            <div className="mb-6">
              <label className="block text-gray-300 text-sm mb-2">
                Select Stock
              </label>
              <select
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:border-green-500"
              >
                {availableStocks.map((stock) => (
                  <option key={stock.symbol} value={stock.symbol}>
                    {stock.symbol} - {stock.name}
                  </option>
                ))}
              </select>
            </div>

            <h2 className="text-2xl font-bold text-white mb-6">
              {symbol}
            </h2>

            {analysis && (
              <div className="space-y-3 mb-6">
                <div className="bg-gray-700 rounded-lg p-3">
                  <p className="text-gray-400 text-sm">Current Price</p>
                  <p className="text-2xl font-bold text-green-400">
                    ${currentPrice.toFixed(2)}
                  </p>
                </div>

                <div className="bg-gray-700 rounded-lg p-3">
                  <p className="text-gray-400 text-sm">Recommendation</p>
                  <p
                    className={`text-xl font-bold ${
                      analysis.recommendation === 'BUY'
                        ? 'text-green-400'
                        : analysis.recommendation === 'SELL'
                        ? 'text-red-400'
                        : 'text-yellow-400'
                    }`}
                  >
                    {analysis.recommendation}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Confidence: {(analysis.confidence * 100).toFixed(0)}%
                  </p>
                </div>

                {holding && (
                  <div className="bg-gray-700 rounded-lg p-3">
                    <p className="text-gray-400 text-sm">You Own</p>
                    <p className="text-lg font-bold text-white">
                      {holding.quantity} shares
                    </p>
                    <p className="text-xs text-gray-400">
                      @ ${holding.buy_price.toFixed(2)}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Trade Section */}
            <div className="border-t border-gray-700 pt-6">
              <div className="mb-4">
                <label className="block text-gray-300 text-sm mb-2">
                  Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:border-green-500"
                />
              </div>

              <div className="mb-4 text-sm">
                <p className="text-gray-400">Total Value</p>
                <p className="text-xl font-bold text-white">
                  ${currentValue.toFixed(2)}
                </p>
              </div>

              <div className="space-y-2">
                <button
                  onClick={handleBuy}
                  disabled={loading}
                  className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-semibold transition-colors disabled:bg-gray-600"
                >
                  🟢 Buy Now
                </button>

                {holding && (
                  <button
                    onClick={handleSell}
                    disabled={loading}
                    className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-semibold transition-colors disabled:bg-gray-600"
                  >
                    🔴 Sell Now
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`mt-6 p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-900 text-green-300'
              : 'bg-red-900 text-red-300'
          }`}
        >
          {message.text}
        </div>
      )}
    </div>
  );
}
