import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ClockIcon, PencilIcon, CheckIcon, XIcon } from '@heroicons/react/outline';
import Spinner from '../../components/layout/Spinner';

export default function KeyDetailPage() {
  const { keyId } = useParams();
  const navigate = useNavigate();
  const [keyData, setKeyData] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

// In your KeyDetailPage.js
useEffect(() => {
    const fetchKeyDetails = async () => {
      try {
        console.log('Fetching key details for:', keyId);
        const response = await fetch(`/api/keys/${keyId}/details`);
        
        console.log('Response status:', response.status);
        if (!response.ok) {
          const errorBody = await response.json();
          console.error('Error response:', errorBody);
          throw new Error(errorBody.error || 'Failed to fetch key details');
        }
        
        const data = await response.json();
        console.log('Received data:', data);
        setKeyData(data);
        setFormData({
            keyCode: data.keyCode,
            description: data.description,
            type: data.type,
            location: data.location,
            status: data.status
          });
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
  
    fetchKeyDetails();
  }, [keyId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSaveChanges = async () => {
    try {
      const response = await fetch(`/api/keys/${keyId}/update`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
         },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save changes');
      }

      const updatedData = await response.json();
      setKeyData(updatedData);
      setEditMode(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCancelEdit = () => {
    setFormData({
      keyCode: keyData.keyCode,
      description: keyData.description,
      type: keyData.type,
      location: keyData.location,
      status: keyData.status
    });
    setEditMode(false);
  };

  if (loading) return <Spinner />;
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;
  if (!keyData) return <div className="p-6">Key not found</div>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex justify-between items-start mb-6">
        <div>
          {editMode ? (
            <input
              name="keyCode"
              value={formData.keyCode}
              onChange={handleInputChange}
              className="text-2xl font-bold border rounded p-1"
            />
          ) : (
            <h1 className="text-2xl font-bold text-gray-800">{keyData.keyCode}</h1>
          )}
          {editMode ? (
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="w-full mt-1 border rounded p-1"
            />
          ) : (
            <p className="text-gray-600 mt-1">{keyData.description}</p>
          )}
        </div>
        
        <div className="flex gap-2">
          {editMode ? (
            <>
              <button
                onClick={handleSaveChanges}
                className="flex items-center bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
              >
                <CheckIcon className="h-5 w-5 mr-1" />
                Save
              </button>
              <button
                onClick={handleCancelEdit}
                className="flex items-center bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700"
              >
                <XIcon className="h-5 w-5 mr-1" />
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditMode(true)}
              className="flex items-center text-blue-600 hover:text-blue-800"
            >
              <PencilIcon className="h-5 w-5 mr-1" />
              Edit Key
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Key Information Section */}
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h2 className="text-sm font-semibold text-gray-500 mb-2">BASIC INFORMATION</h2>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm text-gray-600">Key Type</dt>
                <dd className="font-medium">
                  {editMode ? (
                    <input
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      className="border rounded p-1 w-full"
                    />
                  ) : (
                    keyData.type || 'N/A'
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-600">Location</dt>
                <dd className="font-medium">
                  {editMode ? (
                    <input
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="border rounded p-1 w-full"
                    />
                  ) : (
                    keyData.location
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-600">Date Added</dt>
                <dd className="font-medium">
                  {new Date(keyData.createdAt).toLocaleDateString()}
                </dd>
              </div>
            </dl>
          </div>

          {/* Status Section */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h2 className="text-sm font-semibold text-gray-500 mb-2">CURRENT STATUS</h2>
            <div className="flex items-center space-x-2">
              {editMode ? (
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="border rounded p-1"
                >
                  <option value="available">Available</option>
                  <option value="unavailable">Unavailable</option>
                  <option value="checked-out">Checked Out</option>
                  <option value="lost">Lost</option>
                </select>
              ) : (
                <span className={`px-3 py-1 rounded-full text-sm ${
                  keyData.status === 'available' 
                    ? 'bg-green-100 text-green-700' 
                    : keyData.status === 'lost' 
                      ? 'bg-red-100 text-red-700' 
                      : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {keyData.status}
                </span>
              )}
              {keyData.currentTransaction && (
                <Link
                  to={`/transactions/${keyData.currentTransaction.transactionId}`}
                  className="text-blue-600 text-sm hover:underline"
                >
                  View Active Transaction
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Transaction History Section */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-semibold text-gray-500">TRANSACTION HISTORY</h2>
            <Link
              to={`/inventory/${keyId}/history`}
              className="flex items-center text-blue-600 hover:text-blue-800 text-sm"
            >
              <ClockIcon className="h-4 w-4 mr-1" />
              Full History
            </Link>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-500 border-b">
                  <th className="pb-2">Date</th>
                  <th className="pb-2">Action</th>
                  <th className="pb-2">User</th>
                  <th className="pb-2">Issuer</th>
                </tr>
              </thead>
              <tbody>
                {keyData.transactionHistory.slice(0, 5).map((entry, index) => (
                  <tr key={index} className="border-b last:border-b-0">
                    <td className="py-2">
                      {new Date(entry.date).toLocaleDateString()}
                    </td>
                    <td className="py-2 capitalize">{entry.action}</td>
                    <td className="py-2">
                      {entry.transaction?.user || 'System'}
                    </td>
                    <td className="py-2">
                      {entry.transaction?.issuer || 'Auto-system'}
                    </td>
                  </tr>
                ))}
                {keyData.transactionHistory.length === 0 && (
                  <tr>
                    <td colSpan="4" className="py-4 text-center text-gray-500">
                      No transaction history found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Back Button for Mobile */}
      <button
        onClick={() => navigate(-1)}
        className="mt-6 lg:hidden flex items-center text-gray-600 hover:text-gray-800"
      >
        ← Back to Inventory
      </button>
    </div>
  );
}