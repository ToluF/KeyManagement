import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import TransactionStatusBadge from './TransactionStatusBadge';

const TransactionDetailsModal = ({ transaction, onClose, onReturn, onMarkLost }) => {
  const [markedLost, setMarkedLost] = useState({});
  const [currentTransaction, setCurrentTransaction] = useState(transaction);
  const [loading, setLoading] = useState(false);

  const refreshTransaction = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/transactions/${transaction._id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await res.json();
      setCurrentTransaction(data);
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentTransaction(transaction);
  }, [transaction]);

  const handleAction = async (actionFn, transactionId, keyId) => {
    try {
      await actionFn(transactionId, keyId);
      await refreshTransaction();
      setMarkedLost(prev => ({ ...prev, [keyId]: false }));
    } catch (error) {}
  };

  if (!transaction) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-full overflow-y-auto relative">
        {/* Close button fixed at the top-right */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl"
        >
          &times;
        </button>

        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold">
              Transaction {currentTransaction.transactionId}
              {loading && <span className="ml-2 text-sm text-gray-500">(Updating...)</span>}
            </h3>
            <div className="mt-1">
              <TransactionStatusBadge status={currentTransaction.status} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Issued by</p>
            <p className="font-medium">
              {transaction.issuer?.name || 'Unknown Issuer'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Assigned to</p>
            <p className="font-medium">
              {transaction.user?.name || 'Unknown User'}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Issued on</p>
              <p className="font-medium">
                {new Date(transaction.checkoutDate).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="text-lg font-medium mb-3">Keys in Transaction</h4>
            <div className="space-y-2">
              {currentTransaction.items.map(item => (
                <div
                  key={item.key._id}
                  className="flex justify-between items-center p-3 border rounded"
                >
                  <div>
                    <p className="font-medium">{item.key.keyCode}</p>
                    <p className="text-sm text-gray-600">{item.key.location}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-sm ${
                      item.status === 'checked-out' ? 'bg-blue-100 text-blue-800' :
                      item.status === 'returned' ? 'bg-green-100 text-green-800' :
                      item.status === 'lost' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {item.status}
                    </span>

                    {item.status === 'checked-out' && (
                      <div className="flex gap-2">
                        <label className="flex items-center gap-1 text-sm">
                          <input
                            type="checkbox"
                            checked={!!markedLost[item.key._id]}
                            onChange={(e) => setMarkedLost(prev => ({
                              ...prev,
                              [item.key._id]: e.target.checked
                            }))}
                            className="form-checkbox h-4 w-4"
                          />
                          Mark Lost
                        </label>

                        <button
                          onClick={() => handleAction(
                            markedLost[item.key._id] ? onMarkLost : onReturn,
                            currentTransaction._id,
                            item.key._id
                          )}
                          className={`px-3 py-1 rounded transition-colors ${
                            markedLost[item.key._id]
                              ? 'bg-red-500 hover:bg-red-600 text-white'
                              : 'bg-green-500 hover:bg-green-600 text-white'
                          }`}
                        >
                          {markedLost[item.key._id] ? 'Confirm Lost' : 'Return Key'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

TransactionDetailsModal.propTypes = {
  transaction: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    transactionId: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    checkoutDate: PropTypes.string.isRequired,
    expectedReturn: PropTypes.string,
    items: PropTypes.arrayOf(PropTypes.shape({
      key: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        keyCode: PropTypes.string.isRequired,
        location: PropTypes.string
      }).isRequired,
      status: PropTypes.string.isRequired
    })).isRequired
  }),
  onClose: PropTypes.func.isRequired,
  onReturn: PropTypes.func.isRequired,
  onMarkLost: PropTypes.func.isRequired
};

export default TransactionDetailsModal;
