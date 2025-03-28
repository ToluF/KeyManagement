// src/pages/UserManagement.js
import React, { useState, useEffect } from 'react';
import AddUserModal from '../components/addUser';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch('/api/users', {
          headers: { 
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (!res.ok) throw new Error('Failed to fetch users');
        const data = await res.json();
        setUsers(data);
      } catch (err) {
        setError(err.message);
      }
    };
    fetchUsers();
  }, []);


  const handleAddUser = async (userData) => {
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(userData)
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error);
      }

      const newUser = await res.json();
      setUsers(prev => [...prev, newUser]);
      return true;
    } catch (err) {
      throw err;
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">User Management</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          Add User
        </button>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}
      
      <AddUserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddUser={handleAddUser}
      />
      


      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-medium mb-4">All Users</h2>
        <div className="grid grid-cols-1 gap-4">
          {users.map(user => (
            <div key={user._id} className="p-4 border rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">{user.name}</h3>
                  <p className="text-gray-600">{user.email}</p>
                </div>
                <span className="bg-gray-100 text-gray-800 text-sm px-2.5 py-0.5 rounded">
                  {user.role.toUpperCase()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserManagement;