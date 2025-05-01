import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, XIcon, DocumentTextIcon, ClockIcon, PencilIcon } from '@heroicons/react/outline';

export default function KeyDetailSidebar({ sidebarOpen, setSidebarOpen }) {
  const { keyId } = useParams();
  const navigate = useNavigate();

  const subnavItems = [
    { name: 'Key Details', href: `/inventory/${keyId}/details`, icon: DocumentTextIcon },
    { name: 'History', href: `/inventory/${keyId}/history`, icon: ClockIcon },
    // { name: 'Edit Key', href: `/inventory/${keyId}/edit`, icon: PencilIcon },
  ];

  return (
    <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r shadow-lg transform ${
      sidebarOpen ? 'translate-x-0' : '-translate-x-full'
    } lg:translate-x-0 transition-all duration-200`}>
      <div className="flex items-center justify-between h-16 px-4 border-b">
        <button
          onClick={() => {
            navigate(-1);
            if (window.innerWidth < 1024) setSidebarOpen(false);
          }}
          className="flex items-center text-gray-600 hover:text-primary"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          <span className="hidden lg:inline">Back to Inventory</span>
        </button>
        <button
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden text-gray-500 hover:text-gray-700"
        >
          <XIcon className="h-6 w-6" />
        </button>
      </div>
      
      <nav className="mt-4 overflow-y-auto h-[calc(100vh-4rem)]">
        {subnavItems.map((item) => (
          <Link
            key={item.name}
            to={item.href}
            onClick={() => {
              if (window.innerWidth < 1024) setSidebarOpen(false);
            }}
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