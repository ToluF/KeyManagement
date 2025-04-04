import React from 'react';
import PropTypes from 'prop-types';

/**
 * Transaction-based key assignment modal
 * 
 * @param {Object} props - Component properties
 * @param {boolean} props.open - Modal visibility state
 * @param {Function} props.onClose - Close modal callback
 * @param {Array} props.users - List of system users
 * @param {Array} props.keys - Available keys for assignment
 * @param {Function} props.onSuccess - Callback after successful transaction
 */
const AssignKeyModal = ({ open, onClose, users, keys, onAssign }) => {
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!open) return null;

  /** Handle multi-key selection */
  const handleKeySelect = (keyId) => {
    setSelectedKeys(prev => prev.includes(keyId))
      ? prev.filter(id => id !== keyId)
      : [...prev, keyId];
  };

  /** Create transaction and assign keys */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUser || selectedKeys.length === 0) return;

    setIsSubmitting(true);
    
    try {
      // 1. Create transaction
      const txnRes = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ userId: selectedUser })
      });

      if (!txnRes.ok) throw new Error('Failed to create transaction');
      const { _id: txnId } = await txnRes.json();

      // 2. Add keys to transaction
      const itemsRes = await fetch(`/api/transactions/${txnId}/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ keyIds: selectedKeys })
      });

      if (!itemsRes.ok) throw new Error('Failed to add keys');

      // 3. Finalize transaction
      const checkoutRes = await fetch(`/api/transactions/${txnId}/checkout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!checkoutRes.ok) throw new Error('Checkout failed');

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Transaction error:', error);
      alert(`Assignment failed: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Create Key Transaction</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
            disabled={isSubmitting}
          >
            &times;
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* User Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">Select User</label>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="w-full p-2 border rounded-lg"
              required
              disabled={isSubmitting}
            >
              <option value="">Choose a user...</option>
              {users.map(user => (
                <option key={user._id} value={user._id}>
                  {user.name} ({user.department})
                </option>
              ))}
            </select>
          </div>

          {/* Key Multi-Select */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Select Keys ({selectedKeys.length} selected)
            </label>
            <div className="border rounded-lg p-2 max-h-64 overflow-y-auto">
              {keys.filter(k => k.status === 'available').map(key => (
                <label 
                  key={key._id}
                  className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedKeys.includes(key._id)}
                    onChange={() => handleKeySelect(key._id)}
                    className="form-checkbox h-4 w-4"
                    disabled={isSubmitting}
                  />
                  <div className="ml-2">
                    <p className="font-medium">{key.keyCode}</p>
                    <p className="text-sm text-gray-600">{key.location}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              disabled={!selectedUser || selectedKeys.length === 0 || isSubmitting}
            >
              {isSubmitting ? 'Processing...' : 'Complete Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

AssignKeyModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  users: PropTypes.arrayOf(PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    department: PropTypes.string
  })).isRequired,
  keys: PropTypes.arrayOf(PropTypes.shape({
    _id: PropTypes.string.isRequired,
    keyCode: PropTypes.string.isRequired,
    location: PropTypes.string,
    status: PropTypes.string
  })).isRequired,
  onSuccess: PropTypes.func
};
export default AssignKeyModal;