import React, { useState } from 'react';

const EditKeyModal = ({ keyData, onClose, onSave }) => {
  const [formData, setFormData] = useState(keyData);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onSave(formData);
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Edit Key</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>
        {error && <p className="text-red-500 mb-2">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Key Code"
            value={formData.keyCode}
            onChange={e => setFormData({...formData, keyCode: e.target.value})}
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="text"
            placeholder="Description"
            value={formData.description}
            onChange={e => setFormData({...formData, description: e.target.value})}
            className="w-full p-2 border rounded"
          />
          <input
            type="text"
            placeholder="Location"
            value={formData.location}
            onChange={e => setFormData({...formData, location: e.target.value})}
            className="w-full p-2 border rounded"
            required
          />
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditKeyModal;