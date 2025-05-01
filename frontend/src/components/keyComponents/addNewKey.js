import { useState } from 'react';

export default function AddKeyModal({  onClose, onAddKey }) {
  const [newKey, setNewKey] = useState({
    keyCode: '',
    description: '',
    type: '',
    location: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onAddKey(newKey);
      setNewKey({ keyCode: '', description: '', type: '', location: '' });
      onClose();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-lg w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Add New Key</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Key Code"
            className="w-full px-4 py-2 border rounded-lg"
            value={newKey.keyCode}
            onChange={e => setNewKey({...newKey, keyCode: e.target.value})}
            required
          />
          <input
            type="text"
            placeholder="Type"
            className="w-full px-4 py-2 border rounded-lg"
            value={newKey.type}
            onChange={e => setNewKey({...newKey, type: e.target.value})}
            required
          />
          <input
            type="text"
            placeholder="Location"
            className="w-full px-4 py-2 border rounded-lg"
            value={newKey.location}
            onChange={e => setNewKey({...newKey, location: e.target.value})}
            required
          />
          <textarea
            placeholder="Description"
            className="w-full px-4 py-2 border rounded-lg"
            value={newKey.description}
            onChange={e => setNewKey({...newKey, description: e.target.value})}
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Add Key
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}