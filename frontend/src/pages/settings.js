import { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';

export default function Settings() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

        setUsers(usersData);
        setSettings(settingsData);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    
    if (user?.role === 'admin') {
      fetchData();
    } else {
      setError('Admin privileges required');
      setLoading(false);
    }
  }, [user]);

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
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to update role');
      }
      
      setUsers(prevUsers => 
        prevUsers.map(u => u._id === userId ? { ...u, role: newRole } : u)
      );
    } catch (error) {
      alert(error.message);
    }
  };

  if (!user || user.role !== 'admin') {
    return <div className="p-6 text-red-500">Admin access required</div>;
  }

  if (loading) return <div className="p-6 text-center">Loading settings...</div>;
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;

  return (
    <div className="p-6 space-y-8">
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
                  {user.department && (
                    <p className="text-sm text-gray-500">{user.department}</p>
                  )}
                </div>
                <select
                  value={user.role}
                  onChange={(e) => updateUserRole(user._id, e.target.value)}
                  className="border rounded-lg p-2"
                  disabled={user._id === user.id} // Prevent self-modification
                >
                  <option value="admin">Admin</option>
                  <option value="issuer">Issuer</option>
                  <option value="user">User</option>
                </select>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}