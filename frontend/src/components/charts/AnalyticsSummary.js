import React from 'react';

const AnalyticsSummary = ({ data }) => (
  <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
    <div className="bg-slate-50 p-4 rounded-lg">
      <h4 className="text-sm text-slate-600">Total Keys</h4>
      <p className="text-2xl font-bold">{data.totalKeys}</p>
    </div>
    <div className="bg-green-50 p-4 rounded-lg">
      <h4 className="text-sm text-green-600">Available Keys</h4>
      <p className="text-2xl font-bold">
        {data.keyStatuses?.find(s => s.status === 'available')?.count || 0}
      </p>
    </div>
    <div className="bg-yellow-50 p-4 rounded-lg">
        <h4 className="text-sm text-yellow-600">Checked Out Keys</h4>
        <p className="text-2xl font-bold">
          {data.keyStatuses?.find(s => s.status === 'checked-out')?.count || 0}</p>
    </div>
    <div className="bg-blue-50 p-4 rounded-lg">
      <h4 className="text-sm text-blue-600">Reserved Keys</h4>
      <p className="text-2xl font-bold">
        {data.keyStatuses?.find(s => s.status === 'reserved')?.count || 0}
      </p>
    </div>
    <div className="bg-red-50 p-4 rounded-lg">
      <h4 className="text-sm text-red-600">Lost Keys</h4>
      <p className="text-2xl font-bold">
        {data.keyStatuses?.find(s => s.status === 'lost')?.count || 0}
      </p>
    </div>
    <div className="bg-purple-50 p-4 rounded-lg">
      <h4 className="text-sm text-purple-600">Active Transactions</h4>
      <p className="text-2xl font-bold">
        {Array.isArray(data.transactionTrends) ? data.transactionTrends.reduce((acc, curr) => acc + curr.count, 0) : 0}
      </p>
    </div>
  </div>
);

export default AnalyticsSummary;