import React, { useEffect, useState } from 'react';
import { stockApi, portfolioApi } from '../services/api';

export default function DashboardPage() {
  const [portfolio, setPortfolio] = useState(null);
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [portfolioData, stocksData] = await Promise.all([
        portfolioApi.getPortfolio(),
        stockApi.getAllStocks()
      ]);

      const holdings = (portfolioData.holdings || []).map(h => {
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
        ...portfolioData,
        holdings,
        total_cost,
        total_value,
        total_pnl,
        total_pnl_percent
      });

      setStocks(stocksData);
      setError(null);

    } catch (err) {
      console.error(err);
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  // ✅ SELL 1 (FIXED)
  const handleSellOne = async (company) => {
    try {
      await portfolioApi.sellStock({
        company,
        quantity: 1
      });
      fetchData();
    } catch (error) {
      console.error("Sell 1 failed:", error);
    }
  };

  // 🔥 SELL ALL (FIXED)
  const handleSellAll = async (company, shares) => {
    try {
      const qty = Number(shares);

      if (!qty || qty <= 0) {
        console.error("Invalid shares:", shares);
        return;
      }

      await portfolioApi.sellStock({
        company,
        quantity: qty
      });

      fetchData();

    } catch (error) {
      console.error("Sell All failed:", error);
    }
  };

  if (loading) {
    return <div className="text-white text-center py-10">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="text-red-400 text-center py-10">{error}</div>;
  }

  const pnlPositive = portfolio.total_pnl >= 0;

  return (
    <div className="p-6 md:p-10 bg-gradient-to-br from-slate-900 to-gray-950 min-h-screen text-white">

      <h1 className="text-4xl font-bold mb-8 text-center tracking-wide">
        📊 Trading Dashboard
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">

        <div className="bg-gray-800/70 rounded-2xl p-6 border border-gray-700">
          <p className="text-gray-400 text-sm">Total Invested</p>
          <p className="text-2xl font-bold mt-2">
            ${portfolio.total_cost.toFixed(2)}
          </p>
        </div>

        <div className="bg-gray-800/70 rounded-2xl p-6 border border-gray-700">
          <p className="text-gray-400 text-sm">Current Value</p>
          <p className="text-2xl font-bold mt-2">
            ${portfolio.total_value.toFixed(2)}
          </p>
        </div>

        <div className={`rounded-2xl p-6 border ${
          pnlPositive ? 'bg-green-900/30 border-green-600' : 'bg-red-900/30 border-red-600'
        }`}>
          <p className="text-gray-300 text-sm">Profit / Loss</p>
          <p className={`text-2xl font-bold mt-2 ${
            pnlPositive ? 'text-green-400' : 'text-red-400'
          }`}>
            ${portfolio.total_pnl.toFixed(2)}
          </p>
        </div>

        <div className="bg-gray-800/70 rounded-2xl p-6 border border-gray-700">
          <p className="text-gray-400 text-sm">Return %</p>
          <p className={`text-2xl font-bold mt-2 ${
            pnlPositive ? 'text-green-400' : 'text-red-400'
          }`}>
            {portfolio.total_pnl_percent.toFixed(2)}%
          </p>
        </div>

      </div>

      <div className="bg-gray-900/70 rounded-2xl p-6 border border-gray-700">

        <h2 className="text-2xl font-semibold mb-6">📈 Active Positions</h2>

        {portfolio.holdings.length === 0 ? (
          <div className="text-gray-400 text-center py-10">
            No holdings yet — start trading 🚀
          </div>
        ) : (
          <div className="space-y-4">

            {portfolio.holdings.map((h) => {
              const positive = h.pnl >= 0;

              return (
                <div
                  key={h.company}
                  className="bg-gray-800/70 p-5 rounded-xl border border-gray-700"
                >
                  <div className="flex justify-between items-center">

                    <div>
                      <p className="text-lg font-bold">{h.company}</p>
                      <p className="text-sm text-gray-400">
                        {h.shares} shares @ ${h.avg_price.toFixed(2)}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-xl font-bold">
                        ${h.value.toFixed(2)}
                      </p>
                      <p className={`${positive ? 'text-green-400' : 'text-red-400'} text-sm`}>
                        {positive ? '+' : ''}${h.pnl.toFixed(2)} ({h.pnl_percent.toFixed(2)}%)
                      </p>
                    </div>

                  </div>

                  <div className="flex justify-between items-center mt-4">

                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-blue-400 font-semibold">
                        Confidence: {h.confidence ?? 50}%
                      </span>

                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        h.action === 'BUY' ? 'bg-green-900 text-green-300' :
                        h.action === 'SELL' ? 'bg-red-900 text-red-300' :
                        'bg-yellow-900 text-yellow-300'
                      }`}>
                        {h.action ?? 'HOLD'}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSellOne(h.company)}
                        className="bg-red-500 hover:bg-red-600 px-3 py-2 rounded-lg text-sm"
                      >
                        Sell 1
                      </button>

                      <button
                        onClick={() => handleSellAll(h.company, h.shares)}
                        className="bg-red-700 hover:bg-red-800 px-3 py-2 rounded-lg text-sm"
                      >
                        Sell All
                      </button>
                    </div>

                  </div>
                </div>
              );
            })}

          </div>
        )}
      </div>
    </div>
  );
}