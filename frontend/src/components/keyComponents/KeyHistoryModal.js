import { useState, useEffect } from 'react';

const KeyHistoryModal = ({ keyId, onClose }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch(`/api/keys/${keyId}/history`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (!res.ok) throw new Error('Failed to fetch history');
        const data = await res.json();
        setHistory(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (keyId) fetchHistory();
  }, [keyId]);

  const getActionLabel = (action) => {
    switch (action) {
      case 'checkout': return 'Checked Out';
      case 'return': return 'Returned';
      case 'marked_lost': return 'Marked Lost';
      default: return action;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Key Transaction History</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            &times;
          </button>
        </div>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        {loading ? (
          <div className="text-center py-4">Loading history...</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2 text-left">Action</th>
                <th className="px-4 py-2 text-left">User</th>
                <th className="px-4 py-2 text-left">Notes</th>
              </tr>
            </thead>
            <tbody>
              {history.map((transaction, index) => (
                <tr key={index} className="border-t">
                  <td className="px-4 py-2">
                    {new Date(transaction.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </td>
                  <td className="px-4 py-2 capitalize">
                    {getActionLabel(transaction.action)}
                  </td>
                  <td className="px-4 py-2">
                    {transaction.user?.name || 'System'}
                  </td>
                  <td className="px-4 py-2">{transaction.notes}</td>
                </tr>
              ))}
              {history.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-4 py-2 text-center text-gray-500">
                    No transaction history found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default KeyHistoryModal;