import { MenuAlt2Icon, XIcon } from '@heroicons/react/outline';
import { useAuth } from '../../AuthContext';
import { Link, useLocation } from 'react-router-dom';

export default function Header({ setSidebarOpen, sidebarOpen }) {
  const { logout, user } = useAuth();
  const location = useLocation();

  // Main navigation links for the header
  const mainNavLinks = [
    { name: 'Dashboard', path: '/dashboard', roles: ['admin', 'issuer'] },
    { name: 'Key Management', path: '/inventory', roles: ['admin', 'issuer'] },
    { name: 'Key Exchange', path: '/exchange', roles: ['admin', 'issuer'] },
    { name: 'User Management', path: '/users', roles: ['admin'] },

    // { name: 'Audit Logs', path: '/audit'},
    // { name: 'Reports', path: '/reports' },
    { name: 'Settings', path: '/settings', roles: ['admin'] }
  ];
  
    
  const filteredLinks = mainNavLinks.filter(link => 
    link.roles.includes(user?.role)
  );

  return (
    <div className="fixed w-full lg:w-[calc(100%-16rem)] lg:left-64 top-0 z-50 bg-white shadow-sm">
      {/* Main Header Bar */}
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        {/* Left Side - Menu Button + Desktop Nav */}
        <div className="flex items-center flex-1">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden text-gray-500 hover:text-gray-700 mr-4"
          >
            {sidebarOpen ? (
              <XIcon className="h-6 w-6" />
            ) : (
              <MenuAlt2Icon className="h-6 w-6" />
            )}
          </button>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex space-x-8 mx-auto">
            {filteredLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  location.pathname === link.path
                    ? 'bg-primary text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Right Side - Profile & Logout (Always Visible) */}
        

        
        <div className="flex items-center gap-4 flex-shrink-0">
          <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <button
            onClick={logout}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
          >
            Logout
          </button>
        </div>
      </div>



      {/* Mobile Navigation - Separate Row */}
      <div className="lg:hidden border-t bg-white">
        <div className="flex overflow-x-auto px-4 py-2 space-x-4">
          {filteredLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`shrink-0 px-3 py-2 rounded-md text-sm font-medium ${
                location.pathname === link.path
                  ? 'bg-primary text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}