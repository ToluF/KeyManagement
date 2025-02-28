import { MenuAlt2Icon } from '@heroicons/react/outline';

export default function Header({ setSidebarOpen }) {
  return (
    <div className="sticky top-0 z-10 bg-white shadow-sm">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden text-gray-500 hover:text-gray-700"
        >
          <MenuAlt2Icon className="h-6 w-6" />
        </button>
        
        <div className="flex-1 max-w-xs">
          <input
            type="text"
            placeholder="Search..."
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        
        <div className="flex items-center ml-4">
          <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center">
            JD
          </div>
        </div>
      </div>
    </div>
  );
}