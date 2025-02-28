// src/pages/AuditLogs.js
import { useState, useEffect } from 'react';
// import { format } from 'date-fns';

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    actionType: '',
    userId: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const query = new URLSearchParams({
          page,
          ...filters
        }).toString();
        
        const res = await fetch(`/api/audit?${query}`);
        const { logs: data, totalPages: pages } = await res.json();
        setLogs(data);
        setTotalPages(pages);
      } catch (error) {
        console.error('Failed to fetch audit logs:', error);
      }
    };

    fetchLogs();
  }, [page, filters]);

  const getActionColor = (actionType) => {
    switch(actionType) {
      case 'key_checkout': return 'bg-blue-100 text-blue-800';
      case 'key_return': return 'bg-green-100 text-green-800';
      case 'key_lost': return 'bg-red-100 text-red-800';
      case 'user_modified': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Audit Logs</h1>
        <div className="flex gap-2">
          <input
            type="date"
            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            className="border rounded-lg p-2"
          />
          <select
            onChange={(e) => setFilters({ ...filters, actionType: e.target.value })}
            className="border rounded-lg p-2"
          >
            <option value="">All Actions</option>
            <option value="key_checkout">Key Checkouts</option>
            <option value="key_return">Key Returns</option>
            <option value="key_lost">Lost Keys</option>
            <option value="user_modified">User Modifications</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium">Timestamp</th>
              <th className="px-6 py-3 text-left text-sm font-medium">Action</th>
              <th className="px-6 py-3 text-left text-sm font-medium">User</th>
              <th className="px-6 py-3 text-left text-sm font-medium">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {logs.map(log => (
              <tr key={log._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {formatDate(log.timestamp)}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-sm ${getActionColor(log.actionType)}`}>
                    {log.actionType.replace(/_/g, ' ')}
                  </span>
                </td>
                <td className="px-6 py-4">{log.user?.name || 'System'}</td>
                <td className="px-6 py-4">{log.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <div className="flex justify-between items-center p-4 border-t">
          <button 
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 disabled:opacity-50"
          >
            Previous
          </button>
          <span>Page {page} of {totalPages}</span>
          <button 
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}