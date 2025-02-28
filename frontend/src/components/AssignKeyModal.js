import React from 'react';

const AssignKeyModal = ({ open, onClose, users, keys, onAssign }) => {
  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const userId = formData.get('user');
    const keyId = formData.get('key');
    
    if (userId && keyId) {
      onAssign(userId, keyId);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Assign Key to User</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            &times;
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Select User</label>
            <select
              name="user"
              className="w-full p-2 border rounded-lg"
              required
            >
              <option value="">Choose a user...</option>
              {users.map(user => (
                <option key={user._id} value={user._id}>
                  {user.name} ({user.department})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Select Key</label>
            <select
              name="key"
              className="w-full p-2 border rounded-lg"
              required
            >
              <option value="">Choose a key...</option>
              {keys.map(key => (
                <option key={key._id} value={key._id}>
                  {key.keyCode} - {key.location}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Assign Key
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignKeyModal;