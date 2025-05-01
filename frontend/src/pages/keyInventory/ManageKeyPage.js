import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { KeyIcon, PencilIcon } from '@heroicons/react/outline';
import { toast } from 'react-toastify';
import KeySearch from '../../components/KeySearch';
import KeyStatusFilter from '../../components/KeyStatusFilter';

const ManageKeyPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [keys, setKeys] = useState([]);
  const [selectedKey, setSelectedKey] = useState(null);
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    searchQuery: '',
    status: 'all'
  });

  // Fetch all keys for the sidebar
  useEffect(() => {
    const fetchKeys = async () => {
      try {
        const query = new URLSearchParams(filters);
        const res = await fetch(`/api/keys?${query}`);
        if (!res.ok) throw new Error('Failed to fetch keys');
        const data = await res.json();
        setKeys(data);
      } catch (err) {
        setError(err.message);
      }
    };
    fetchKeys();
  }, [filters]);

  // Fetch selected key details
  useEffect(() => {
    const fetchKeyDetails = async () => {
      if (!id) {
        setFormData(null);
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(`/api/keys/${id}`);
        if (!res.ok) throw new Error('Key not found');
        const data = await res.json();
        setFormData(data);
        setError('');
      } catch (err) {
        setError(err.message);
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchKeyDetails();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/keys/${id}/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Update failed');
      }

      toast.success('Key updated successfully!');
      // Refresh the key list
      const updatedKeys = keys.map(k => k._id === id ? formData : k);
      setKeys(updatedKeys);
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto flex gap-6">
      {/* Key List Sidebar */}
      <div className="w-80 flex-shrink-0">
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <KeyIcon className="h-6 w-6 mr-2" />
            Manage Keys
          </h2>
          <div className="space-y-4">
            <KeySearch 
              value={filters.searchQuery}
              onChange={(value) => setFilters(prev => ({...prev, searchQuery: value}))}
            />
            <KeyStatusFilter
              value={filters.status}
              onChange={(value) => setFilters(prev => ({...prev, status: value}))}
            />
          </div>
        </div>

        <div className="space-y-2">
          {keys.map(key => (
            <div
              key={key._id}
              onClick={() => navigate(`/inventory/manage/${key._id}`)}
              className={`p-3 cursor-pointer rounded-lg ${
                id === key._id ? 'bg-blue-50 border-l-4 border-blue-500' : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="font-medium">{key.keyCode}</span>
                <span className={`text-sm px-2 py-1 rounded-full ${
                  key.status === 'available' ? 'bg-green-100 text-green-700' :
                  key.status === 'lost' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {key.status}
                </span>
              </div>
              <p className="text-sm text-gray-600 truncate">{key.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Form */}
      <div className="flex-1">
        <div className="bg-white rounded-lg shadow-sm p-6">
          {id ? (
            <>
              {loading ? (
                <div className="text-center py-4">Loading key details...</div>
              ) : (
                formData && (
                  <>
                    <div className="flex items-center mb-6">
                      <PencilIcon className="h-8 w-8 text-gray-600 mr-3" />
                      <h2 className="text-2xl font-bold">
                        Edit Key {formData.keyCode}
                      </h2>
                    </div>

                    {error && <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">{error}</div>}

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Key Code</label>
                        <input
                          type="text"
                          value={formData.keyCode}
                          className="w-full p-2 border rounded bg-gray-100"
                          disabled
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">Description</label>
                        <input
                          type="text"
                          value={formData.description}
                          onChange={(e) => setFormData({...formData, description: e.target.value})}
                          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">Location *</label>
                        <input
                          type="text"
                          value={formData.location}
                          onChange={(e) => setFormData({...formData, location: e.target.value})}
                          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">Status *</label>
                        <select
                          value={formData.status}
                          onChange={(e) => setFormData({...formData, status: e.target.value})}
                          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="available">Available</option>
                          <option value="checked-out">Checked Out</option>
                          <option value="lost">Lost</option>
                        </select>
                      </div>

                      <div className="flex justify-end gap-2 mt-6">
                        <button
                          type="button"
                          onClick={() => navigate('/inventory/manage')}
                          className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          Save Changes
                        </button>
                      </div>
                    </form>
                  </>
                )
              )}
            </>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Select a key from the list to edit
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageKeyPage;