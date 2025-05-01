import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { format } from 'date-fns';

export default function TransactionTrends({ transactions }) {
  // Process data for chart
  const chartData = (Array.isArray(transactions) ? transactions : []).map(item => ({
    date: isNaN(new Date(item._id)) ? null : new Date(item._id),
    transactions: item.count,
  }));

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm h-80">
      <h3 className="text-lg font-medium mb-4">Transaction Trends (Last 30 Days)</h3>
      <ResponsiveContainer width="100%" height="90%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="date"
            tickFormatter={(date) => (date ? format(date, 'MMM dd') : '')}
          />
          <YAxis />
          <Tooltip 
            labelFormatter={(date) => (date ? format(new Date(date), 'PP') : '')}
          />
          <Line 
            type="monotone"
            dataKey="transactions"
            stroke="#2563eb"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}