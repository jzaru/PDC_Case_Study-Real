import React, { useEffect, useState } from 'react';
import { portfolioApi } from '../services/api';

export default function PortfolioPage() {
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPortfolio();
    const interval = setInterval(fetchPortfolio, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchPortfolio = async () => {
    try {
      const data = await portfolioApi.getPortfolio();

      const holdings = (data.holdings || []).map(h => {
        const avg_price = h.cost / h.shares;
        const pnl = h.value - h.cost;
        const pnl_percent = h.cost > 0 ? (pnl / h.cost) * 100 : 0;

        return { ...h, avg_price, pnl, pnl_percent };
      });

      const total_cost = holdings.reduce((sum, h) => sum + h.cost, 0);
      const total_value = holdings.reduce((sum, h) => sum + h.value, 0);
      const total_pnl = total_value - total_cost;
      const total_pnl_percent = total_cost > 0 ? (total_pnl / total_cost) * 100 : 0;

      setPortfolio({
        ...data,
        holdings,
        total_cost,
        total_value,
        total_pnl,
        total_pnl_percent
      });

      setError(null);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch portfolio');
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

  const pnlPositive = portfolio.total_pnl >= 0;

  return (
    <div className="p-6 md:p-10 bg-gradient-to-br from-slate-900 to-gray-950 min-h-screen text-white">

      {/* HEADER */}
      <h1 className="text-4xl font-bold mb-8 text-center tracking-wide">
        💼 Portfolio Dashboard
      </h1>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">

        <div className="bg-gray-800/70 backdrop-blur rounded-2xl p-6 shadow-lg border border-gray-700">
          <p className="text-gray-400 text-sm">Total Invested</p>
          <p className="text-2xl font-bold mt-2">
            ${portfolio.total_cost.toFixed(2)}
          </p>
        </div>

        <div className="bg-gray-800/70 backdrop-blur rounded-2xl p-6 shadow-lg border border-gray-700">
          <p className="text-gray-400 text-sm">Current Value</p>
          <p className="text-2xl font-bold mt-2">
            ${portfolio.total_value.toFixed(2)}
          </p>
        </div>

        <div className={`rounded-2xl p-6 shadow-lg border ${
          pnlPositive ? 'bg-green-900/30 border-green-600' : 'bg-red-900/30 border-red-600'
        }`}>
          <p className="text-gray-300 text-sm">Profit / Loss</p>
          <p className={`text-2xl font-bold mt-2 ${
            pnlPositive ? 'text-green-400' : 'text-red-400'
          }`}>
            ${portfolio.total_pnl.toFixed(2)}
          </p>
        </div>

        <div className="bg-gray-800/70 backdrop-blur rounded-2xl p-6 shadow-lg border border-gray-700">
          <p className="text-gray-400 text-sm">Return %</p>
          <p className={`text-2xl font-bold mt-2 ${
            pnlPositive ? 'text-green-400' : 'text-red-400'
          }`}>
            {portfolio.total_pnl_percent.toFixed(2)}%
          </p>
        </div>

      </div>

      {/* HOLDINGS TABLE */}
      <div className="bg-gray-900/70 backdrop-blur rounded-2xl shadow-xl border border-gray-700 p-6">

        <h2 className="text-2xl font-semibold mb-6">📊 Holdings</h2>

        {portfolio.holdings.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            No holdings yet. Start trading 🚀
          </div>
        ) : (
          <div className="overflow-x-auto">

            <table className="w-full text-sm">

              <thead>
                <tr className="border-b border-gray-700 text-gray-400 text-xs uppercase tracking-wider">
                  <th className="text-left py-3">Company</th>
                  <th className="text-right py-3">Shares</th>
                  <th className="text-right py-3">Avg</th>
                  <th className="text-right py-3">Price</th>
                  <th className="text-right py-3">Value</th>
                  <th className="text-right py-3">PnL</th>
                  <th className="text-right py-3">%</th>
                </tr>
              </thead>

              <tbody>
                {portfolio.holdings.map((h) => {
                  const positive = h.pnl >= 0;

                  return (
                    <tr
                      key={h.company}
                      className="border-b border-gray-800 hover:bg-gray-800/50 transition"
                    >
                      <td className="py-4 font-semibold text-white">
                        {h.company}
                      </td>

                      <td className="py-4 text-right text-gray-300">
                        {h.shares}
                      </td>

                      <td className="py-4 text-right text-gray-400">
                        ${h.avg_price.toFixed(2)}
                      </td>

                      <td className="py-4 text-right text-gray-300">
                        ${h.current_price.toFixed(2)}
                      </td>

                      <td className="py-4 text-right font-semibold text-white">
                        ${h.value.toFixed(2)}
                      </td>

                      <td className={`py-4 text-right font-semibold ${
                        positive ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {positive ? '+' : ''}
                        ${h.pnl.toFixed(2)}
                      </td>

                      <td className={`py-4 text-right font-semibold ${
                        positive ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {positive ? '+' : ''}
                        {h.pnl_percent.toFixed(2)}%
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