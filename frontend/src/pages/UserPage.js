// import React, { useState, useEffect } from 'react';
// import AddUserModal from '../components/addUser';
// import EditUserModal from '../components/EditUserModal';

// const UserManagement = () => {
//   const [users, setUsers] = useState([]);
//   const [selectedUser, setSelectedUser] = useState(null);
//   const [isAddModalOpen, setIsAddModalOpen] = useState(false);
//   const [isEditModalOpen, setIsEditModalOpen] = useState(false);
//   const [error, setError] = useState('');

//   useEffect(() => {
//     const fetchUsers = async () => {
//       try {
//         const res = await fetch('/api/users', {
//           headers: { 
//             'Authorization': `Bearer ${localStorage.getItem('token')}`
//           }
//         });
//         if (!res.ok) throw new Error('Failed to fetch users');
//         const data = await res.json();
//         setUsers(data);
//       } catch (err) {
//         setError(err.message);
//       }
//     };
//     fetchUsers();
//   }, []);


//   const handleAddUser = async (userData) => {
//     try {
//       const res = await fetch('/api/users', {
//         method: 'POST',
//         headers: { 
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${localStorage.getItem('token')}`
//         },
//         body: JSON.stringify(userData)
//       });
      
//       if (!res.ok) {
//         const errorData = await res.json();
//         throw new Error(errorData.error);
//       }

//       const newUser = await res.json();
//       setUsers(prev => [...prev, newUser]);
//       return true;
//     } catch (err) {
//       throw err;
//     }
//   };

//   const handleUpdateUser = async (updatedData) => {
//     try {
//       const res = await fetch(`/api/users/${updatedData._id}`, {
//         method: 'PUT',
//         headers: { 
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${localStorage.getItem('token')}`
//         },
//         body: JSON.stringify(updatedData)
//       });
      
//       if (!res.ok) {
//         const errorData = await res.json();
//         throw new Error(errorData.error);
//       }

//       const updatedUser = await res.json();
//       setUsers(prev => prev.map(u => u._id === updatedUser._id ? updatedUser : u));
//       return true;
//     } catch (err) {
//       throw err;
//     }
//   };

//   return (
//     <div className="p-6">
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-2xl font-bold">User Management</h1>
//         <button
//           onClick={() => setIsAddModalOpen(true)}
//           className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
//         >
//           Add User
//         </button>
//       </div>

//       {error && <p className="text-red-500 mb-4">{error}</p>}
      
//       <AddUserModal
//         isOpen={isAddModalOpen}
//         onClose={() => setIsAddModalOpen(false)}
//         onAddUser={handleAddUser}
//       />
            
//       <EditUserModal
//         user={selectedUser}
//         isOpen={isEditModalOpen}
//         onClose={() => setIsEditModalOpen(false)}
//         onUpdateUser={handleUpdateUser}
//       />


//       <div className="bg-white p-6 rounded-lg shadow-sm">
//         <h2 className="text-lg font-medium mb-4">All Users</h2>
//         <div className="grid grid-cols-1 gap-4">
//           {users.map(user => (
//             <div key={user._id} className="p-4 border rounded-lg">
//               <div className="flex justify-between items-center">
//                 <div>
//                   <h3 className="font-semibold">{user.name}</h3>
//                   <p className="text-gray-600">{user.email}</p>
//                   {user.department && <p className="text-sm text-gray-500">{user.department}</p>}

//                 </div>
//                 <div className="flex items-center gap-2">
//                   <span className="bg-gray-100 text-gray-800 text-sm px-2.5 py-0.5 rounded">
//                     {user.role.toUpperCase()}
//                   </span>
//                   <button
//                     onClick={() => {
//                       setSelectedUser(user);
//                       setIsEditModalOpen(true);
//                     }}
//                     className="px-2 py-1 text-blue-600 hover:text-blue-800"
//                   >
//                     Edit
//                   </button>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default UserManagement;

// src/pages/UserListPage.js
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import UserSearch from '../components/userComponents/UserSearch';
import UserRoleFilter from '../components/userComponents/UserRoleFilter';

export default function UserListPage() {
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({
    searchQuery: '',
    role: 'all'
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [filters]);

  if (loading) return <div>Loading users...</div>;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">User Management</h1>
        <button
          onClick={() => navigate('/users/add')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Add New User
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <UserSearch 
          value={filters.searchQuery}
          onChange={(value) => setFilters(prev => ({...prev, searchQuery: value}))}
        />
        <UserRoleFilter
          value={filters.role}
          onChange={(value) => setFilters(prev => ({...prev, role: value}))}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map(user => (
          <div key={user._id} className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="text-lg font-semibold">{user.name}</h3>
                <p className="text-gray-600">{user.email}</p>
              </div>
              <span className={`px-2 py-1 text-sm rounded-full ${
                user.role === 'admin' 
                  ? 'bg-purple-100 text-purple-700' 
                  : user.role === 'issuer' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-gray-100 text-gray-700'
              }`}>
                {user.role}
              </span>
            </div>
            <div className="space-y-2">
              {user.department && (
                <p className="text-sm text-gray-600">Department: {user.department}</p>
              )}
              <div className="flex justify-between items-center text-sm">
                <button 
                  onClick={() => navigate(`/users/roles/${user._id}`)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  Edit Role
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}