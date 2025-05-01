import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UserGroupIcon, PencilIcon } from '@heroicons/react/outline';
import UserSearch from '../../components/userComponents/UserSearch';
import UserRoleFilter from '../../components/userComponents/UserRoleFilter';

const EditUserRolePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    role: 'user',
    department: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    searchQuery: '',
    role: 'all'
  });

  // Fetch all users for the sidebar
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const query = new URLSearchParams(filters);
        const res = await fetch(`/api/users?${query}`, {
          headers: { 
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const data = await res.json();
        setUsers(data);
      } catch (err) {
        setError(err.message);
      }
    };
    fetchUsers();
  }, [filters]);

  // Fetch selected user details
  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!id) {
        setFormData(null);
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(`/api/users/${id}`, {
          headers: { 
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const data = await res.json();
        setSelectedUser(data);
        setFormData({
          role: data.role,
          department: data.department || ''
        });
        setError('');
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/users/${id}`, {
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

      navigate('/users');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto flex gap-6">
      {/* User List Sidebar */}
      <div className="w-80 flex-shrink-0">
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <UserGroupIcon className="h-6 w-6 mr-2" />
            Manage Users
          </h2>
          <div className="space-y-4">
            <UserSearch 
              value={filters.searchQuery}
              onChange={(value) => setFilters(prev => ({...prev, searchQuery: value}))}
            />
            <UserRoleFilter
              value={filters.role}
              onChange={(value) => setFilters(prev => ({...prev, role: value}))}
            />
          </div>
        </div>

        <div className="space-y-2">
          {users.map(user => (
            <div
              key={user._id}
              onClick={() => navigate(`/users/roles/${user._id}`)}
              className={`p-3 cursor-pointer rounded-lg ${
                id === user._id ? 'bg-blue-50 border-l-4 border-blue-500' : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="font-medium">{user.name}</span>
                <span className={`text-sm px-2 py-1 rounded-full ${
                  user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                  user.role === 'issuer' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                }`}>
                  {user.role}
                </span>
              </div>
              <p className="text-sm text-gray-600 truncate">{user.email}</p>
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
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading user details...</p>
                </div>
              ) : (
                selectedUser && (
                  <>
                    <div className="flex items-center mb-6">
                      <PencilIcon className="h-8 w-8 text-gray-600 mr-3" />
                      <h2 className="text-2xl font-bold">
                        Edit {selectedUser.name}'s Role
                      </h2>
                    </div>

                    {error && <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">{error}</div>}

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <input
                          type="email"
                          value={selectedUser.email}
                          className="w-full p-2 border rounded bg-gray-100"
                          disabled
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">Role *</label>
                        <select
                          value={formData.role}
                          onChange={(e) => setFormData({...formData, role: e.target.value})}
                          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="user">Standard User</option>
                          <option value="issuer">Key Issuer</option>
                          <option value="admin">Administrator</option>
                        </select>
                      </div>

                      {formData.role === 'user' && (
                        <div>
                          <label className="block text-sm font-medium mb-1">Department *</label>
                          <input
                            type="text"
                            value={formData.department}
                            onChange={(e) => setFormData({...formData, department: e.target.value})}
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>
                      )}

                      <div className="flex justify-end gap-2 mt-6">
                        <button
                          type="button"
                          onClick={() => navigate('/users/role')}
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
              Select a user from the list to edit
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditUserRolePage;