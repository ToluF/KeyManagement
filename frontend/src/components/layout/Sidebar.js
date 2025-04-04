import { XIcon, HomeIcon, KeyIcon, UserGroupIcon, CogIcon } from '@heroicons/react/outline';

export default function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const navigation = [
    { name: 'Dashboard', href: '/', icon: HomeIcon },
    { name: 'Inventory', href: '/inventory', icon: KeyIcon },
    { name: 'Key Exchange', href: '/exchange', icon: KeyIcon },
    { name: 'Audit Log', href: '/audit', icon: KeyIcon },
    // { name: 'Add Key', href: '/add-key', icon: KeyIcon },
    { name: 'Users', href: '/users', icon: UserGroupIcon },
    { name: 'Reports', href: '/reports', icon: KeyIcon },
    { name: 'Settings', href: '/settings', icon: CogIcon },
  ];

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
            className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100"
          >
            <item.icon className="h-5 w-5 mr-3" />
            {item.name}
          </a>
        ))}
      </nav>
    </div>
  );
}