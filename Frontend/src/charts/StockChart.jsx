import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

export default function StockChart({ data, symbol }) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 text-center text-gray-400">
        No data available for {symbol}
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
      <h3 className="text-xl font-bold text-white mb-4">
        {symbol} - Price Trend
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#444" />
          <XAxis
            dataKey="date"
            tick={{ fill: '#999' }}
            tickFormatter={(date) => date.substring(5)}
          />
          <YAxis
            tick={{ fill: '#999' }}
            domain={['dataMin - 5', 'dataMax + 5']}
          />
          <Tooltip
            contentStyle={{ backgroundColor: '#444', border: 'none' }}
            labelStyle={{ color: '#fff' }}
            formatter={(value) => `$${value.toFixed(2)}`}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="close"
            stroke="#10b981"
            name="Close Price"
            dot={{ fill: '#10b981', r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="open"
            stroke="#8b5cf6"
            name="Open Price"
            dot={{ fill: '#8b5cf6', r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
