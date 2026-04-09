import React, { useEffect, useState } from 'react';
import { stockApi } from '../services/api';

export default function DashboardPage({ userId }) {
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPortfolio();
    const interval = setInterval(fetchPortfolio, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, [userId]);

  const fetchPortfolio = async () => {
    try {
      const data = await stockApi.getPortfolio(userId);
      setPortfolio(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch portfolio');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-white text-center py-10">Loading portfolio...</div>;
  }

  if (error) {
    return <div className="text-red-400 text-center py-10">{error}</div>;
  }

  const profitLossColor = portfolio?.profit_loss >= 0 ? 'text-green-400' : 'text-red-400';
  const profitLossBgColor = portfolio?.profit_loss >= 0 ? 'bg-green-900' : 'bg-red-900';

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-white mb-8">📊 Dashboard</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
          <p className="text-gray-400 text-sm">Total Invested</p>
          <p className="text-2xl font-bold text-white mt-2">
            ${portfolio?.total_invested?.toFixed(2) || '0.00'}
          </p>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
          <p className="text-gray-400 text-sm">Current Value</p>
          <p className="text-2xl font-bold text-white mt-2">
            ${portfolio?.current_value?.toFixed(2) || '0.00'}
          </p>
        </div>

        <div className={`rounded-lg p-6 shadow-lg ${profitLossBgColor}`}>
          <p className="text-gray-300 text-sm">Profit/Loss</p>
          <p className={`text-2xl font-bold mt-2 ${profitLossColor}`}>
            ${portfolio?.profit_loss?.toFixed(2) || '0.00'}
          </p>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
          <p className="text-gray-400 text-sm">Return %</p>
          <p className={`text-2xl font-bold mt-2 ${profitLossColor}`}>
            {portfolio?.profit_loss_percent?.toFixed(2) || '0.00'}%
          </p>
        </div>
      </div>

      {/* Holdings */}
      <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
        <h2 className="text-xl font-bold text-white mb-4">📈 Current Holdings</h2>

        {Object.keys(portfolio?.holdings || {}).length === 0 ? (
          <p className="text-gray-400">No active holdings. Start trading!</p>
        ) : (
          <div className="space-y-3">
            {Object.entries(portfolio.holdings).map(([symbol, holding]) => (
              <div
                key={symbol}
                className="bg-gray-700 rounded-lg p-4 flex justify-between items-center"
              >
                <div>
                  <p className="text-white font-semibold">{symbol}</p>
                  <p className="text-gray-400 text-sm">
                    {holding.quantity} shares @ ${holding.buy_price.toFixed(2)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-white font-bold">
                    ${holding.value.toFixed(2)}
                  </p>
                  <p className="text-gray-400 text-sm">
                    Current: ${holding.current_price.toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
