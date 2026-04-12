import React, { useEffect, useState } from 'react';
import { stockApi, simulationApi } from '../services/api';
import StockCard from '../components/StockCard';

export default function StocksPage({ onSelectStock }) {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [simulationRunning, setSimulationRunning] = useState(false);

  useEffect(() => {
    fetchStocks();
    fetchSimulationStatus();

    const interval = setInterval(fetchStocks, simulationRunning ? 2000 : 10000);
    return () => clearInterval(interval);
  }, [simulationRunning]);

  useEffect(() => {
    const statusInterval = setInterval(fetchSimulationStatus, 5000);
    return () => clearInterval(statusInterval);
  }, []);

  const fetchStocks = async () => {
    try {
      const data = await stockApi.getAllStocks();

      // 🔥 Normalize backend response → frontend-safe
      const normalized = data.map(stock => ({
        ...stock,
        current_price: stock.price ?? 0,
        confidence: stock.confidence ?? 50,
        action: stock.action ?? "HOLD"
      }));

      setStocks(normalized);
      setError(null);
    } catch (err) {
      setError('Failed to fetch stocks');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSimulationStatus = async () => {
    try {
      const data = await simulationApi.getSimulationStatus();
      setSimulationRunning(data.running);
    } catch (err) {
      console.error('Error fetching simulation status:', err);
    }
  };

  const filteredAndSortedStocks = stocks
    .filter((stock) =>
      stock.company.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'price_low':
          return a.current_price - b.current_price;

        case 'price_high':
          return b.current_price - a.current_price;

        case 'confidence':
          return b.confidence - a.confidence;

        case 'name':
        default:
          return a.company.localeCompare(b.company);
      }
    });

  if (loading) {
    return <div className="text-white text-center py-10">Loading stocks...</div>;
  }

  if (error) {
    return <div className="text-red-400 text-center py-10">{error}</div>;
  }

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
      <h1 className="text-3xl font-bold text-white mb-8 text-center">
        📈 Available Stocks
      </h1>

      {/* Search and Sort */}
      <div className="mb-8 flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
        <div className="flex-1 w-full lg:max-w-md">
          <input
            type="text"
            placeholder="Search stocks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:border-green-500"
          />
        </div>

        <div className="w-full lg:w-48">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full px-4 py-3 bg-gray-800 text-white border border-gray-700 rounded-lg"
          >
            <option value="name">Name (A-Z)</option>
            <option value="price_low">Price: Low to High</option>
            <option value="price_high">Price: High to Low</option>
            <option value="confidence">Confidence</option>
          </select>
        </div>
      </div>

      {/* Stock Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6 w-full">
        {filteredAndSortedStocks.map((stock) => (
          <StockCard
            key={stock.company}
            stock={stock}
            onSelect={onSelectStock}
          />
        ))}
      </div>

      {filteredAndSortedStocks.length === 0 && (
        <div className="text-gray-400 text-center py-10">
          No stocks found matching "{searchTerm}"
        </div>
      )}

      <div className="mt-8 text-gray-400 text-sm text-center">
        Showing {filteredAndSortedStocks.length} of {stocks.length} stocks
      </div>
    </div>
  );
}