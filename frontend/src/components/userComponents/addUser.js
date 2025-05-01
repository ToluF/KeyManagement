import { useState } from 'react';

export default function AddUserModal({ isOpen, onClose, onAddUser }) {
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
    department: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!newUser.password) {
        throw new Error('Password is required');
      }
      await onAddUser(newUser);
      setNewUser({ name: '', email: '', password: '', role: 'user', department: '' });
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
          <h2 className="text-xl font-bold">Add New User</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Full Name"
            className="w-full px-4 py-2 border rounded-lg"
            value={newUser.name}
            onChange={e => setNewUser(p => ({ ...p, name: e.target.value }))}
            required
          />
          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-2 border rounded-lg"
            value={newUser.email}
            onChange={e => setNewUser(p => ({ ...p, email: e.target.value }))}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full px-4 py-2 border rounded-lg"
            value={newUser.password}
            onChange={e => setNewUser(p => ({ ...p, password: e.target.value }))}
            required
          />
          <select
            className="w-full px-4 py-2 border rounded-lg"
            value={newUser.role}
            onChange={e => setNewUser(p => ({ ...p, role: e.target.value }))}
            required
          >
            <option value="user">User</option>
            <option value="issuer">Key Issuer</option>
            <option value="admin">Administrator</option>
          </select>
          {newUser.role === 'user' && (
            <input
              type="text"
              placeholder="Department"
              className="w-full px-4 py-2 border rounded-lg"
              value={newUser.department}
              onChange={e => setNewUser(p => ({ ...p, department: e.target.value }))}
              required={newUser.role === 'user'}
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
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Add User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}