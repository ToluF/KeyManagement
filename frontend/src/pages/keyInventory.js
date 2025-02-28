import { useState, useEffect } from 'react';
import AddKey from '../components/addNewKey';
import KeyHistoryModal from '../components/KeyHistoryModal';
import EditKeyModal from '../components/EditKeyModal';

export default function Keys() {
  const [keys, setKeys] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedKey, setSelectedKey] = useState(null);
  const [editKey, setEditKey] = useState(null);

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

  const handleUpdateKey = async (updatedKey) => {
    try {
      const res = await fetch(`/api/keys/${updatedKey._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedKey)
      });
      
      if (!res.ok) throw new Error('Failed to update key');
      
      setKeys(keys.map(k => k._id === updatedKey._id ? updatedKey : k));
      setEditKey(null);
    } catch (error) {
      console.error('Update error:', error);
      throw error;
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Add New Key
        </button>
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
          {keys.map(key => (
            <div key={key._id} className="p-4 border rounded-lg">
              <h3 className="font-medium text-lg">{key.keyCode}</h3>
              <p className="text-gray-600 mt-2">{key.description}</p>
              <div className="mt-2 flex justify-between items-center">
                <span className="text-sm bg-gray-100 px-2 py-1 rounded">
                  {key.location}
                </span>
                <span className={`text-sm font-medium ${
                  key.status === 'available' 
                    ? 'text-green-600' 
                    : 'text-orange-600'
                }`}>
                  {key.status.toUpperCase()}
                </span>
              </div>
              <div className="mt-2 flex gap-2">
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
          ))}
        </div>
      </div>
    </div>
  );
}

