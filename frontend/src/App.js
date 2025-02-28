// src/App.js
import React from 'react';
import { BrowserRouter, Routes, Route,Outlet, Navigate} from 'react-router-dom';
import { AuthProvider } from  './AuthContext';
import ProtectedRoute from './ProtectedRoute';
import { useState } from 'react';


// Import pages
import Dashboard from './pages/Dashboard';
import KeyExchangeStatus from './pages/exchange';
import KeyInventory from './pages/keyInventory';
import AuditLog from './pages/audit';
import Users from './pages/Users';
import Settings from './pages/settings';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/register';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
// import Settings from './pages/Settings';



const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      <div className="lg:pl-64 flex flex-col flex-1">
        <Header setSidebarOpen={setSidebarOpen} />
        
        <main className="flex-1 pb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route element={<ProtectedRoute/>}>
            <Route element={<DashboardLayout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard/>} />
              <Route path="/inventory" element={<KeyInventory />} />
              <Route path="/exchange" element={<KeyExchangeStatus />} />
              <Route path="/users" element={<Users />} />
              <Route path="/audit" element={<AuditLog />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
    
  );
}

export default App;
