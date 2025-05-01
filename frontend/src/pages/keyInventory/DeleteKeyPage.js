import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

export default function DeleteKeyPage() {
  const [keys, setKeys] = useState([]);
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchKeys = async () => {
      try {
        const res = await fetch('/api/keys');
        if (!res.ok) throw new Error('Failed to fetch keys');
        const data = await res.json();
        setKeys(data);
      } catch (err) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchKeys();
  }, []);

  const handleDeactivate = async (keyId) => {
    try {
      const res = await fetch(`/api/keys/${keyId}/deactivate`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
  
      if (!res.ok) throw new Error('Deactivation failed');
      
      const data = await res.json();
      setKeys(prev => prev.map(k => k._id === data._id ? data : k));
      toast.success('Key deactivated successfully');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleBulkDeactivate = async () => {
    try {
      const res = await fetch('/api/keys/bulk', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ ids: selectedKeys })
      });
  
      if (!res.ok) throw new Error('Bulk deactivation failed');
      
      setKeys(prev => prev.map(k => 
        selectedKeys.includes(k._id) ? { ...k, status: 'unavailable' } : k
      ));
      setSelectedKeys([]);
      toast.success('Selected keys deactivated');
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-sm">
      <h2 className="text-2xl font-bold mb-6">Deactivate Keys</h2>
      
      <div className="mb-4">
        <button
          onClick={handleBulkDeactivate}
          disabled={selectedKeys.length === 0}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-400"
        >
          Deactivate Selected ({selectedKeys.length})
        </button>
      </div>

      {loading ? (
        <div className="text-center py-4">Loading keys...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3"></th>
                <th className="px-4 py-3 text-left">Key Code</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {keys.map(key => (
                <tr key={key._id} className="border-t">
                  <td className="px-4 py-2">
                    <input
                      type="checkbox"
                      checked={selectedKeys.includes(key._id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedKeys([...selectedKeys, key._id]);
                        } else {
                          setSelectedKeys(selectedKeys.filter(id => id !== key._id));
                        }
                      }}
                    />
                  </td>
                  <td className="px-4 py-2">{key.keyCode}</td>
                  <td className="px-4 py-2 capitalize">{key.status}</td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => handleDeactivate(key._id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Deactivate
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}