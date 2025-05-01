import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';

const COLORS = ['#10B981', '#FBBF24', '#3B82F6', '#EF4444'];

const KeyStatusChart = ({ data }) => {
  // Map aggregated data to chart format
  const chartData = [
    { name: 'Available', value: data.find(d => d.status === 'available')?.count || 0 },
    { name: 'Checked Out', value: data.find(d => d.status === 'checked-out')?.count || 0 },
    { name: 'Reserved', value: data.find(d => d.status === 'reserved')?.count || 0 },
    { name: 'Lost', value: data.find(d => d.status === 'lost')?.count || 0 }
  ];

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Key Status Distribution</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value">
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default KeyStatusChart;
