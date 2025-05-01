import { Link } from 'react-router-dom';
import { HomeIcon, XIcon, UserGroupIcon, PlusIcon, PencilIcon } from '@heroicons/react/outline';

export default function UserManagementSidebar({ sidebarOpen, setSidebarOpen }) {
  const userManagementNavigation = [
    { name: '← Back to Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'User Directory', href: '/users', icon: UserGroupIcon },
    { name: 'Add User', href: '/users/add', icon: PlusIcon },
    { name: 'Manage Roles', href: '/users/roles', icon: PencilIcon },
  ];

  return (
    <div className={`fixed inset-y-0 left-0 z-50 w-64 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition duration-200 ease-in-out bg-white shadow-lg`}>
      <div className="flex items-center justify-between h-16 px-4 border-b">
        <h1 className="text-xl font-bold text-primary">User Management</h1>
        <button
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden text-gray-500 hover:text-gray-700"
        >
          <XIcon className="h-6 w-6" />
        </button>
      </div>
      
      <nav className="mt-4">
        {userManagementNavigation.map((item) => (
          <Link
            key={item.name}
            to={item.href}
            className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100"
          >
            <item.icon className="h-5 w-5 mr-3" />
            {item.name}
          </Link>
        ))}
      </nav>
    </div>
  );
}