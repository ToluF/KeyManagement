// src/pages/Settings.js
import { useState, useEffect } from 'react';

export default function Settings() {
  const [users, setUsers] = useState([]);
  const [settings, setSettings] = useState({
    keyCheckoutDuration: 7,
    allowSelfCheckout: false,
    notificationPreferences: {
      email: true,
      sms: false
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Get token from localStorage
  const getAuthHeader = () => ({
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, settingsRes] = await Promise.all([
          fetch('/api/users', { headers: getAuthHeader() }),
          fetch('/api/settings', { headers: getAuthHeader() })
        ]);

        if (!usersRes.ok) throw new Error('Failed to fetch users');
        if (!settingsRes.ok) throw new Error('Failed to fetch settings');

        const usersData = await usersRes.json();
        const settingsData = await settingsRes.json();

        setUsers(usersData.users || []); // Ensure array format
        setSettings(settingsData);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const updateUserRole = async (userId, newRole) => {
    try {
      const res = await fetch(`/api/users/${userId}/role`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify({ role: newRole })
      });
      
      if (!res.ok) throw new Error('Failed to update role');
      
      setUsers(prevUsers => 
        prevUsers.map(u => u._id === userId ? { ...u, role: newRole } : u)
      );
    } catch (error) {
      console.error('Role update error:', error);
      alert(error.message);
    }
  };

  const saveSettings = async () => {
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify(settings)
      });
      
      if (!res.ok) throw new Error('Failed to save settings');
      alert('Settings saved successfully');
    } catch (error) {
      console.error('Save settings error:', error);
      alert(error.message);
    }
  };

  if (loading) return <div className="p-6 text-center">Loading settings...</div>;
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;

  return (
    <div className="p-6 space-y-8">
      {/* User Management */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-bold mb-4">User Management</h2>
        <div className="space-y-4">
          {users.length === 0 ? (
            <p className="text-gray-500">No users found</p>
          ) : (
            users.map(user => (
              <div key={user._id} className="flex items-center justify-between p-3 border rounded">
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-gray-600">{user.email}</p>
                </div>
                <select
                  value={user.role || 'user'}
                  onChange={(e) => updateUserRole(user._id, e.target.value)}
                  className="border rounded-lg p-2"
                >
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                  <option value="user">User</option>
                </select>
              </div>
            ))
          )}
        </div>
      </div>

      {/* System Settings - Keep existing JSX but add error handling */}
    </div>
  );
}