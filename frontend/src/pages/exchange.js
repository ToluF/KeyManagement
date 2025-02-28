// src/pages/KeyExchangeStatus.js
import React, { useState, useEffect } from 'react';
import AssignKeyModal from '../components/AssignKeyModal';
import KeyDetailsModal from '../components/KeyDetailsModal';

const KeyExchangeStatus = () => {
  const [exchangeData, setExchangeData] = useState({ users: [], keys: [] });
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModals, setShowModals] = useState({ assign: false, details: false });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Process data from API response
  const processExchangeData = (data) => ({
    users: data.users.map(user => ({
      ...user,
      _id: user._id.toString() // Convert user IDs to strings
    })),
    keys: data.keys.map(key => ({
      ...key,
      _id: key._id.toString(),
      assignedTo: key.assignedTo?._id?.toString() // Handle populated assignedTo
    }))
  });

  // Fetch and process data
  const fetchExchangeData = async () => {
    try {
      const res = await fetch('/api/exchange', {
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!res.ok) throw new Error('Failed to fetch data');
      const data = await res.json();
      setExchangeData(processExchangeData(data));
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExchangeData();
  }, []);

  const handleKeyAction = async (action, body) => {
    try {
      const res = await fetch(`/api/exchange/${action}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(body)
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Action failed');
      }

      // Refresh data using same processing
      await fetchExchangeData();
    } catch (error) {
      console.error('Error:', error);
      alert(error.message);
    }
  };

  if (loading) return <div className="p-6 text-center">Loading...</div>;
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Key Exchange Status</h1>
        <button
          onClick={() => setShowModals({ ...showModals, assign: true })}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Assign Key
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {exchangeData.users.map(user => (
          <div key={user._id} className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-semibold">{user.name}</h2>
                <p className="text-gray-600">{user.email}</p>
              </div>
              <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded">
                {user.department}
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Assigned Keys:</span>
                <span className="font-medium">
                  {exchangeData.keys.filter(k => k.assignedTo === user._id).length}
                </span>
              </div>
              <button 
                onClick={() => {
                  setSelectedUser(user);
                  setShowModals({ ...showModals, details: true });
                }}
                className="w-full mt-2 px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded"
              >
                Manage Keys
              </button>
            </div>
          </div>
        ))}
      </div>

      <AssignKeyModal
        open={showModals.assign}
        onClose={() => setShowModals(p => ({...p, assign: false}))}
        users={exchangeData.users}
        keys={exchangeData.keys.filter(k => k.status === 'available')}
        onAssign={(userId, keyId) => handleKeyAction('assign', { userId, keyId })}
      />

      {selectedUser && (
        <KeyDetailsModal
          open={showModals.details}
          user={selectedUser}
          keys={exchangeData.keys.filter(k => 
            k.assignedTo === selectedUser._id.toString() // Ensure string comparison
          )}
          onClose={() => setShowModals(p => ({...p, details: false}))}
          onReturn={(keyId) => handleKeyAction('return', { keyId })}
          onMarkLost={(keyId) => handleKeyAction('mark-lost', { keyId })}
        />
      )}
    </div>
  );
};

export default KeyExchangeStatus;