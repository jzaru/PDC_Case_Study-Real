import React, { useEffect, useState } from 'react';
import { stockApi } from '../services/api';
import StockCard from '../components/StockCard';

export default function StocksPage({ onSelectStock }) {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchStocks();
    const interval = setInterval(fetchStocks, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchStocks = async () => {
    try {
      const data = await stockApi.getAllStocks();
      setStocks(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch stocks');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredStocks = stocks.filter((stock) =>
    stock.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="text-white text-center py-10">Loading stocks...</div>;
  }

  if (error) {
    return <div className="text-red-400 text-center py-10">{error}</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-white mb-8">📈 Available Stocks</h1>

      {/* Search Bar */}
      <div className="mb-8">
        <input
          type="text"
          placeholder="Search stocks (e.g., AAPL, GOOGL)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-3 bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:border-green-500"
        />
      </div>

      {/* Stock Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStocks.map((stock) => (
          <StockCard
            key={stock.symbol}
            stock={stock}
            onSelect={onSelectStock}
          />
        ))}
      </div>

      {filteredStocks.length === 0 && (
        <div className="text-gray-400 text-center py-10">
          No stocks found matching "{searchTerm}"
        </div>
      )}

      <div className="mt-8 text-gray-400 text-sm">
        Total stocks available: {filteredStocks.length}
      </div>
    </div>
  );
}
