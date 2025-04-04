// components/EditUserModal.js
import { useState, useEffect } from 'react';

export default function EditUserModal({ user, isOpen, onClose, onUpdateUser }) {
  const [editedUser, setEditedUser] = useState({});
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setEditedUser({
        ...user,
        password: '' // Don't pre-fill password
      });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onUpdateUser(editedUser);
      onClose();
    } catch (err) {
      setError(err.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-lg w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Edit User</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Name"
            className="w-full px-4 py-2 border rounded-lg"
            value={editedUser.name || ''}
            onChange={e => setEditedUser(p => ({ ...p, name: e.target.value }))}
            required
          />
          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-2 border rounded-lg"
            value={editedUser.email || ''}
            onChange={e => setEditedUser(p => ({ ...p, email: e.target.value }))}
            required
          />
          <input
            type="password"
            placeholder="New Password (leave blank to keep current)"
            className="w-full px-4 py-2 border rounded-lg"
            value={editedUser.password || ''}
            onChange={e => setEditedUser(p => ({ ...p, password: e.target.value }))}
          />
          <select
            className="w-full px-4 py-2 border rounded-lg"
            value={editedUser.role || 'user'}
            onChange={e => setEditedUser(p => ({ ...p, role: e.target.value }))}
          >
            <option value="user">User</option>
            <option value="issuer">Issuer</option>
            <option value="admin">Admin</option>
          </select>
          {editedUser.role === 'user' && (
            <input
              type="text"
              placeholder="Department"
              className="w-full px-4 py-2 border rounded-lg"
              value={editedUser.department || ''}
              onChange={e => setEditedUser(p => ({ ...p, department: e.target.value }))}
              required={editedUser.role === 'user'}
            />
          )}
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
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}