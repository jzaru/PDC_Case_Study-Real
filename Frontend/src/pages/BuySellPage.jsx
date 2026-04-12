import React, { useEffect, useState } from 'react';
import { stockApi, portfolioApi } from '../services/api';
import StockChart from '../charts/StockChart';

export default function BuySellPage({ selectedCompany, onCompanyChange }) {
  const [company, setCompany] = useState(selectedCompany || 'AAPL');
  const [quantity, setQuantity] = useState(1);
  const [history, setHistory] = useState([]);
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [availableStocks, setAvailableStocks] = useState([]);
  const [confidence, setConfidence] = useState(50.0);
  const [action, setAction] = useState('HOLD');
  const [currentPrice, setCurrentPrice] = useState(0); // 🔥 NEW

  useEffect(() => {
    setCompany(selectedCompany || 'AAPL');
  }, [selectedCompany]);

  useEffect(() => {
    fetchStocks();
  }, []);

  useEffect(() => {
    fetchData();
  }, [company]);

  const fetchStocks = async () => {
    try {
      const stocks = await stockApi.getAllStocks();

      // 🔥 normalize
      const normalized = stocks.map(s => ({
        ...s,
        current_price: s.price ?? 0
      }));

      setAvailableStocks(normalized);
    } catch (error) {
      console.error('Error fetching stocks:', error);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [historyData, portfolioData, stocks] = await Promise.all([
        stockApi.getStockHistory(company),
        portfolioApi.getPortfolio(),
        stockApi.getAllStocks(), // 🔥 get live price
      ]);

      setHistory(historyData.history || []);
      setConfidence(historyData.confidence || 50.0);
      setAction(historyData.action || 'HOLD');
      setPortfolio(portfolioData);

      // 🔥 get REAL current price (simulation aware)
      const stock = stocks.find(s => s.company === company);
      setCurrentPrice(stock?.price ?? 0);

    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: 'Failed to load data' });
    } finally {
      setLoading(false);
    }
  };

  // ========================
  // FIXED TRANSACTIONS
  // ========================

  const handleBuy = async () => {
    if (quantity <= 0) {
      setMessage({ type: 'error', text: 'Quantity must be greater than 0' });
      return;
    }

    try {
      const result = await portfolioApi.buyStock({
        company,
        quantity: parseInt(quantity),
      }); // 🔥 FIXED PAYLOAD

      if (result.success) {
        setMessage({
          type: 'success',
          text: `✓ Bought ${quantity} shares of ${company}`,
        });
        setQuantity(1);
        fetchData();
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (error) {
      console.error(error);
      setMessage({
        type: 'error',
        text: error?.response?.data?.detail || 'Transaction failed',
      });
    }
  };

  const handleSell = async () => {
    if (quantity <= 0) {
      setMessage({ type: 'error', text: 'Quantity must be greater than 0' });
      return;
    }

    try {
      const result = await portfolioApi.sellStock({
        company,
        quantity: parseInt(quantity),
      }); // 🔥 FIXED PAYLOAD

      if (result.success) {
        setMessage({
          type: 'success',
          text: `✓ Sold ${quantity} shares of ${company}`,
        });
        setQuantity(1);
        fetchData();
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (error) {
      console.error(error);
      setMessage({
        type: 'error',
        text: error?.response?.data?.detail || 'Transaction failed',
      });
    }
  };

  const holding = portfolio?.holdings?.find(h => h.company === company);
  const currentValue = currentPrice * quantity;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-white mb-8 text-center">
        💰 Buy / Sell Stocks
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Chart */}
        <div className="lg:col-span-2">
          {loading ? (
            <div className="bg-gray-800 p-6 text-center text-gray-400">
              Loading chart...
            </div>
          ) : history.length > 0 ? (
            <StockChart data={history} symbol={company} />
          ) : (
            <div className="bg-gray-800 p-6 text-center text-gray-400">
              No data
            </div>
          )}
        </div>

        {/* Trade Panel */}
        <div className="bg-gray-800 p-6 rounded-lg">

          <select
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="w-full mb-4 p-2 bg-gray-700 text-white"
          >
            {availableStocks.map((stock) => (
              <option key={stock.company} value={stock.company}>
                {stock.company}
              </option>
            ))}
          </select>

          <p className="text-green-400 text-2xl mb-4">
            ${currentPrice.toFixed(2)}
          </p>

          <p className="text-blue-400">Confidence: {confidence}%</p>
          <p className="text-yellow-400 mb-4">Action: {action}</p>

          {holding && (
            <p className="text-white mb-4">
              You own: {holding.shares}
            </p>
          )}

          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full mb-4 p-2 bg-gray-700 text-white"
          />

          <p className="text-white mb-4">
            Total: ${currentValue.toFixed(2)}
          </p>

          <button onClick={handleBuy} className="w-full bg-green-500 p-2 mb-2">
            Buy
          </button>

          {holding && (
            <button onClick={handleSell} className="w-full bg-red-500 p-2">
              Sell
            </button>
          )}
        </div>
      </div>

      {message && (
        <div className="mt-4 p-3 bg-gray-700 text-white">
          {message.text}
        </div>
      )}
    </div>
  );
}