import { useState, useEffect } from 'react';
import AddKey from '../components/addNewKey';
import KeyHistoryModal from '../components/KeyHistoryModal';
import EditKeyModal from '../components/EditKeyModal';

export default function Keys() {
  const [keys, setKeys] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedKey, setSelectedKey] = useState(null);
  const [editKey, setEditKey] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchKeys();
  }, []);

  const fetchKeys = async () => {
    try {
      const res = await fetch('/api/keys');
      if (!res.ok) throw new Error('Failed to fetch keys');
      setKeys(await res.json());
    } catch (error) {
      console.error('Fetch error:', error);
      alert('Error loading keys');
    }
  };

  const handleAddKey = async (newKey) => {
    try {
      const res = await fetch('/api/keys/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newKey)
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to add key');
      }

      const addedKey = await res.json();
      setKeys(prev => [...prev, addedKey]);
      return true;
    } catch (error) {
      console.error('Add key error:', error);
      throw error;
    }
  };
  
  // pages/Keys.js
  const handleUpdateKey = async (updatedKey) => {
    try {
      const res = await fetch(`/api/keys/${updatedKey._id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(updatedKey)
      });

      const responseData = await res.json();
      
      if (!res.ok) {
        throw new Error(responseData.error || 'Failed to update key');
      }

      setKeys(keys.map(k => k._id === updatedKey._id ? responseData : k));
      setEditKey(null);
    } catch (error) {
      console.error('Update error:', error);
      throw error;
    }
  };

    // Filter keys based on search input
  const filteredKeys = keys.filter(
    (key) =>
      key.keyCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      key.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Add New Key
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by key code or description..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <AddKey
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddKey={handleAddKey}
      />

      {selectedKey && (
        <KeyHistoryModal 
          keyId={selectedKey}
          onClose={() => setSelectedKey(null)}
        />
      )}

      {editKey && (
        <EditKeyModal
          keyData={editKey}
          onClose={() => setEditKey(null)}
          onSave={handleUpdateKey}
        />
      )}
      
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-medium mb-4">All Keys</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredKeys.length > 0 ? (
            filteredKeys.map((key) => (
              <div key={key._id} className="p-5 border rounded-lg shadow-sm bg-gray-50">
                <h3 className="font-semibold text-lg text-gray-800">{key.keyCode}</h3>
                <p className="text-gray-600 mt-2">{key.description}</p>
                <div className="mt-2 flex justify-between items-center">
                  <span className="text-sm bg-gray-200 px-3 py-1 rounded-full">
                    {key.location}
                  </span>
                  <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
                    key.status === 'available' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-orange-100 text-orange-700'
                  }`}>
                    {key.status.toUpperCase()}
                  </span>
                </div>
                <div className="mt-4 flex gap-4">
                  <button
                    onClick={() => setEditKey(key)}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setSelectedKey(key._id)}
                    className="mt-2 text-sm text-blue-600 hover:underline"
                  >
                    View History
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No matching keys found.</p>
          )}
        </div>
      </div>
    </div>
  );
}

