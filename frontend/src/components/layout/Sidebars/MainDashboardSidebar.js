import { Link } from 'react-router-dom';
import { useAuth } from '../../../AuthContext';
import { XIcon, HomeIcon, KeyIcon, UserGroupIcon, CogIcon, DocumentTextIcon } from '@heroicons/react/outline';

export default function MainDashboardSidebar({sidebarOpen, setSidebarOpen }) {
  const {user} = useAuth(); // Assuming you have a useAuth hook to get user info
  const mainNavigation = [
    { name: 'System Overview', href: '/dashboard', icon: HomeIcon, roles: ['admin', 'issuer'] },
    { name: 'Home', href: '/user-dashboard', icon: HomeIcon, roles: ['user'] },

    // { name: 'Key Inventory', href: '/inventory', icon: KeyIcon },
    // { name: 'Key Exchange', href: '/exchange', icon: KeyIcon },
    // { name: 'User Directory', href: '/users', icon: UserGroupIcon },
    // { name: 'report page', href: '/reports', icon: UserGroupIcon },
    { name: 'Audit Logs', href: '/audit', icon: DocumentTextIcon, roles: ['admin'] },
    { name: 'Reports', href: '/reports', icon: DocumentTextIcon, roles: ['admin'] },
    // { name: 'System Settings', href: '/settings', icon: CogIcon },
  ];

  const filteredNav = mainNavigation.filter(item => 
    item.roles.includes('*') || item.roles.includes(user?.role)
  );

  return (
    <div className={`fixed inset-y-0 left-0 z-50 w-64 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition duration-200 ease-in-out bg-white shadow-lg`}>
      <div className="flex items-center justify-between h-16 px-4 border-b">
        <h1 className="text-xl font-bold text-primary">KeyMaster</h1>
        <button
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden text-gray-500 hover:text-gray-700"
        >
          <XIcon className="h-6 w-6" />
        </button>
      </div>
      
      <nav className="mt-4">
        {filteredNav.map((item) => (
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