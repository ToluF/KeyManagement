import { XIcon, HomeIcon, KeyIcon, UserGroupIcon, CogIcon, DocumentTextIcon, PlusIcon, PencilIcon, TrashIcon, ExclamationCircleIcon } from '@heroicons/react/outline';
import { useLocation } from 'react-router-dom';

export default function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const location = useLocation();
  
  // Dashboard-specific navigation
  const dashboardNavigation = [
    { name: 'Dashboard', href: '/', icon: HomeIcon },
    { name: 'Inventory', href: '/inventory', icon: KeyIcon },
    { name: 'Key Exchange', href: '/exchange', icon: KeyIcon },
    { name: 'Audit Log', href: '/audit', icon: DocumentTextIcon },
    // { name: 'Add Key', href: '/add-key', icon: KeyIcon },
    { name: 'Users', href: '/users', icon: UserGroupIcon },
    { name: 'Reports', href: '/reports', icon: DocumentTextIcon },
    { name: 'Settings', href: '/settings', icon: CogIcon },
  ];

  // Inventory-specific navigation
  const inventoryNavigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'All Keys', href: '/inventory', icon: KeyIcon },
    { name: 'Add Key', href: '/inventory/add', icon: PlusIcon},
    { name: 'Manage Keys', href: '/inventory/manage', icon: DocumentTextIcon },
    { name: 'Lost Keys', href: '/inventory/lost', icon: ExclamationCircleIcon },
    { name: 'Key History', href: '/inventory/history', icon: DocumentTextIcon },
    { name: 'Delete Keys', href: '/inventory/delete', icon: TrashIcon },
  ];

  const userManagementNavigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'List Users', href: '/users', icon: UserGroupIcon  },
    { name: 'Add User', href: '/users/add', icon: PlusIcon },
    { name: 'Edit Roles', href: '/users/roles', icon: PencilIcon }
  ];
  const isInventory = location.pathname.startsWith('/inventory');
  const isUserManagement = location.pathname.startsWith('/users');
  // Determine which navigation to show
  const navigation = isInventory
    ? inventoryNavigation
    : isUserManagement
    ? userManagementNavigation
    : dashboardNavigation;
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
        {navigation.map((item) => (
          <a
            key={item.name}
            href={item.href}
            className={`flex items-center px-4 py-3 ${
              location.pathname === item.href 
                ? 'bg-gray-100 text-primary' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            {item.icon && <item.icon className="h-5 w-5 mr-3" />}
            {item.name}
          </a>
        ))}
      </nav>
    </div>
  );
}