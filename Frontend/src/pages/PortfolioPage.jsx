import React, { useEffect, useState } from 'react';
import { portfolioApi } from '../services/api';

export default function PortfolioPage({ userId }) {
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPortfolio();
    const interval = setInterval(fetchPortfolio, 5000);
    return () => clearInterval(interval);
  }, [userId]);

  const fetchPortfolio = async () => {
    try {
      const data = await portfolioApi.getPortfolio(userId);
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
      <h1 className="text-3xl font-bold text-white mb-8">💼 My Portfolio</h1>

      {/* Portfolio Summary */}
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
        <h2 className="text-xl font-bold text-white mb-6">Portfolio Holdings</h2>

        {Object.keys(portfolio?.holdings || {}).length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400 text-lg">No active holdings</p>
            <p className="text-gray-500 text-sm mt-2">
              Start trading to build your portfolio
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 text-gray-300">Symbol</th>
                  <th className="text-right py-3 text-gray-300">Quantity</th>
                  <th className="text-right py-3 text-gray-300">Buy Price</th>
                  <th className="text-right py-3 text-gray-300">Current Price</th>
                  <th className="text-right py-3 text-gray-300">Total Value</th>
                  <th className="text-right py-3 text-gray-300">P&L</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(portfolio.holdings).map(([symbol, holding]) => {
                  const totalCost = holding.quantity * holding.buy_price;
                  const currentValue = holding.quantity * holding.current_price;
                  const profitLoss = currentValue - totalCost;
                  const profitLossPercent = (profitLoss / totalCost * 100).toFixed(2);
                  const color = profitLoss >= 0 ? 'text-green-400' : 'text-red-400';

                  return (
                    <tr
                      key={symbol}
                      className="border-b border-gray-700 hover:bg-gray-700 transition-colors"
                    >
                      <td className="py-4 text-white font-semibold">{symbol}</td>
                      <td className="text-right text-gray-300">
                        {holding.quantity}
                      </td>
                      <td className="text-right text-gray-300">
                        ${holding.buy_price.toFixed(2)}
                      </td>
                      <td className="text-right text-gray-300">
                        ${holding.current_price.toFixed(2)}
                      </td>
                      <td className="text-right text-white font-semibold">
                        ${currentValue.toFixed(2)}
                      </td>
                      <td className={`text-right font-semibold ${color}`}>
                        ${profitLoss.toFixed(2)} ({profitLossPercent}%)
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
