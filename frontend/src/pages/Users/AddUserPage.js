import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AddUserPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
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
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error);
      }

      navigate('/users');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Create New User</h1>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      
      <form onSubmit={handleSubmit} className="space-y-4">
      <input
            type="text"
            placeholder="Full Name"
            className="w-full px-4 py-2 border rounded-lg"
            value={formData.name}
            onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
            required
          />
          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-2 border rounded-lg"
            value={formData.email}
            onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full px-4 py-2 border rounded-lg"
            value={formData.password}
            onChange={e => setFormData(p => ({ ...p, password: e.target.value }))}
            required
          />
          <select
            className="w-full px-4 py-2 border rounded-lg"
            value={formData.role}
            onChange={e => setFormData(p => ({ ...p, role: e.target.value }))}
            required
          >
            <option value="user">User</option>
            <option value="issuer">Key Issuer</option>
            <option value="admin">Administrator</option>
          </select>
          {formData.role === 'user' && (
            <input
              type="text"
              placeholder="Department"
              className="w-full px-4 py-2 border rounded-lg"
              value={formData.department}
              onChange={e => setFormData(p => ({ ...p, department: e.target.value }))}
              required={formData.role === 'user'}
            />
          )}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => navigate('/users')}
            className="px-4 py-2 bg-gray-200 rounded-lg"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Create User
          </button>
        </div>
      </form>
    </div>
  );
}