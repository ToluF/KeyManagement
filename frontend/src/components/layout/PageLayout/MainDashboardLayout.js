import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import MainDashboardSidebar from '../Sidebars/MainDashboardSidebar';
import Breadcrumbs from '../../Breadcrumbs';
import Header from '../Header';

export default function MainDashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100">
      <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <MainDashboardSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      <div className="lg:pl-64 flex flex-col flex-1 pt-16">        
        <main className="flex-1 pb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Breadcrumbs />
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}