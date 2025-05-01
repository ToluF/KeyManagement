import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import EditKeyModal from '../../components/keyComponents/EditKeyModal';
import AddKeyModal from '../../components/keyComponents/addNewKey';
import KeySearch from '../../components/keyComponents/KeySearch';
import KeyStatusFilter from '../../components/keyComponents/KeyStatusFilter';

export default function KeyListPage() {
  const [keys, setKeys] = useState([]);
  const [filters, setFilters] = useState({
    searchQuery: '',
    status: 'all'
  });
  const [selectedKey, setSelectedKey] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const navigate = useNavigate();
  

  useEffect(() => {
    const fetchKeys = async () => {
      const query = new URLSearchParams(filters);
      const res = await fetch(`/api/keys?${query}`);
      const data = await res.json();
      setKeys(data);
    };
    fetchKeys();
  }, [filters]);

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
      setShowAddModal(false);
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
        body: JSON.stringify({
          type: updatedKey.type,
          location: updatedKey.location
        })
      });

      const responseData = await res.json();
      
      if (!res.ok) {
        throw new Error(responseData.error || 'Failed to update key');
      }

      setKeys(keys.map(k => k._id === responseData._id ? responseData : k));
      setEditKey(null);
    } catch (error) {
      console.error('Update error:', error);
      throw error;
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Add Key Modal */}
      {showAddModal && (
        <AddKeyModal
          onClose={() => setShowAddModal(false)}
          onAddKey={handleAddKey}
        />
      )}

      {/* Edit Key Modal */}
      {selectedKey && (
        <EditKeyModal
          keyData={selectedKey}
          onClose={() => setSelectedKey(null)}
          onSave={handleUpdateKey}
        />
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Key Inventory</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Add New Key
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <KeySearch 
          value={filters.searchQuery}
          onChange={(value) => setFilters(prev => ({...prev, searchQuery: value}))}
        />
        <KeyStatusFilter
          value={filters.status}
          onChange={(value) => setFilters(prev => ({...prev, status: value}))}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {keys.map(key => (
          <div 
            key={key._id} 
            className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <Link 
              to={`/inventory/${key._id}/details`}
              className="block hover:no-underline"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold">{key.keyCode}</h3>
                <span className={`px-2 py-1 text-sm rounded-full ${
                  key.status === 'available' 
                    ? 'bg-green-100 text-green-700' 
                    : key.status === 'lost' 
                      ? 'bg-red-100 text-red-700'
                      : key.status === 'reserved'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {key.status}
                </span>
              </div>
              <div className="space-y-2">
                <p className="text-gray-600">{key.description}</p>
                <div className="flex justify-between items-center text-sm">
                  <span className="bg-gray-100 px-2 py-1 rounded">{key.location}</span>
                </div>
              </div>
            </Link>
            <div className="mt-3 flex justify-end space-x-2">
                {/* <button 
                  onClick={() => navigate(`/inventory/history/${key._id}`)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  View History
                </button> */}
              <button
                onClick={() => setSelectedKey(key)}
                className="text-sm text-blue-600 hover:underline"
              >
                Quick Edit
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}