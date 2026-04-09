import React, { useEffect, useState } from 'react';
import { portfolioApi } from '../services/api';

export default function TransactionsPage({ userId }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTransactions();
    const interval = setInterval(fetchTransactions, 3000);
    return () => clearInterval(interval);
  }, [userId]);

  const fetchTransactions = async () => {
    try {
      const data = await portfolioApi.getTransactions(userId, 100);
      setTransactions(data.transactions || []);
      setError(null);
    } catch (err) {
      setError('Failed to fetch transactions');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-white text-center py-10">Loading transactions...</div>;
  }

  if (error) {
    return <div className="text-red-400 text-center py-10">{error}</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-white mb-8">📋 Transaction History</h1>

      {transactions.length === 0 ? (
        <div className="bg-gray-800 rounded-lg p-8 text-center">
          <p className="text-gray-400 text-lg">No transactions yet</p>
          <p className="text-gray-500 text-sm mt-2">
            Your trading history will appear here
          </p>
        </div>
      ) : (
        <div className="bg-gray-800 rounded-lg p-6 shadow-lg overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 text-gray-300">Date</th>
                <th className="text-left py-3 text-gray-300">Symbol</th>
                <th className="text-left py-3 text-gray-300">Type</th>
                <th className="text-right py-3 text-gray-300">Quantity</th>
                <th className="text-right py-3 text-gray-300">Price</th>
                <th className="text-right py-3 text-gray-300">Amount</th>
                <th className="text-right py-3 text-gray-300">P&L</th>
              </tr>
            </thead>
            <tbody>
              {[...transactions].reverse().map((transaction, index) => (
                <tr
                  key={index}
                  className="border-b border-gray-700 hover:bg-gray-700 transition-colors"
                >
                  <td className="py-4 text-gray-300">
                    {transaction.date}
                  </td>
                  <td className="py-4 text-white font-semibold">
                    {transaction.symbol}
                  </td>
                  <td className="py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        transaction.type === 'BUY'
                          ? 'bg-green-900 text-green-300'
                          : 'bg-red-900 text-red-300'
                      }`}
                    >
                      {transaction.type}
                    </span>
                  </td>
                  <td className="py-4 text-right text-gray-300">
                    {transaction.quantity}
                  </td>
                  <td className="py-4 text-right text-gray-300">
                    ${transaction.price.toFixed(2)}
                  </td>
                  <td className="py-4 text-right text-white font-semibold">
                    ${transaction.total.toFixed(2)}
                  </td>
                  <td className="py-4 text-right">
                    {transaction.profit_loss !== undefined ? (
                      <span
                        className={
                          transaction.profit_loss >= 0
                            ? 'text-green-400'
                            : 'text-red-400'
                        }
                      >
                        ${transaction.profit_loss.toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-6 text-gray-400 text-sm">
        <p>Total transactions: {transactions.length}</p>
      </div>
    </div>
  );
}
