// import React from 'react';
// import { Outlet } from 'react-router-dom';

// export default function KeyInventoryLayout() {
//   return (
//     <div className="flex-1 p-6">
//       <Outlet />
//     </div>
//   );
// }

import { Outlet, useParams } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { MenuIcon } from '@heroicons/react/outline'; // Ensure this is the correct library for MenuIcon
import InventorySidebar from '../Sidebars/InventorySidebar';
import KeyDetailSidebar from '../Sidebars/KeyDetailSidebar';
import Breadcrumbs from '../../Breadcrumbs';
import Header from '../Header';

export default function KeyInventoryLayout() {
  const { keyId } = useParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close sidebar when keyId changes (mobile)
  useEffect(() => {
    if (keyId && window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  }, [keyId]);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Main content area */}
      <div className={`pt-16 lg:pl-64 transition-margin duration-200`}>
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <Breadcrumbs />
          <Outlet />      
        </div>
      </div>
     
      <div className={`fixed inset-y-0 left-0 z-40 w-64 transform ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full '
      } lg:translate-x-0 transition-all duration-200 ease-in-out bg-white border-r`}>
        {keyId ? (
          <KeyDetailSidebar 
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
          />
        ) : (
          <InventorySidebar 
            sidebarOpen={sidebarOpen} 
            setSidebarOpen={setSidebarOpen} />
        )}
      </div>


    </div>
  );
}