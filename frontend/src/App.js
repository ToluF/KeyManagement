import React from 'react';
import { BrowserRouter, Routes, Route, Navigate} from 'react-router-dom';
import { AuthProvider } from  './AuthContext';
import ProtectedRoute from './ProtectedRoute';
import { ToastContainer } from 'react-toastify';

// Import pages
import Dashboard from './pages/Dashboard';
import UserDashboard from './pages/UserDashboard';
import KeyExchangeStatus from './pages/exchange';
import MainDashboardLayout from './components/layout/PageLayout/MainDashboardLayout';
import UnauthorizedPage from './pages/UnauthorizedPage';
// import KeyInventory from './pages/keyInventory';
import AuditLog from './pages/audit';
import Users from './pages/UserPage';
import Settings from './pages/settings';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/register';
import Report from './pages/ReportsPage';
import KeyInventoryLayout from './components/layout/PageLayout/KeyInventoryLayout';
import KeyListPage from './pages/keyInventory/KeyListPage';
import LostKeysPage from './pages/keyInventory/LostKeysPage';
import DeleteKeysPage from './pages/keyInventory/DeleteKeyPage';
import KeyHistoryPage from './pages/keyInventory/KeyHistoryPage';
import UserManagementLayout from './components/layout/PageLayout/UserManagenmentLayout';
import AddUserPage from './pages/Users/AddUserPage';
import EditUserRolePage from './pages/Users/EditUserRolePage';
import KeyDetailPage from './pages/keyInventory/KeyDetailPage';
import MyRequests from './pages/MyRequests';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
      <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* Admin routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin']}/>}>
            <Route element={<MainDashboardLayout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              {/* <Route path="/" element={<Navigate to="/dashboard" replace />} /> */}
              <Route path="/dashboard" element={<Dashboard/>} />
              {/* <Route path="/inventory" element={<KeyInventory />} /> */}
              <Route path="/exchange" element={<KeyExchangeStatus />} />
              {/* <Route path="/users" element={<Users />} /> */}
              <Route path="/audit" element={<AuditLog />} />
              <Route path="/reports" element={<Report />} />
              <Route path="/settings" element={<Settings />} />
            </Route>

            <Route path="/inventory/*" element={<KeyInventoryLayout />}>
              <Route index element={<KeyListPage />} />
              {/* <Route path="add" element={<AddKeyPage />} /> */}
              <Route path="lost" element={<LostKeysPage />} />
              <Route path="delete" element={<DeleteKeysPage />} />
              {/* <Route path="manage/:id" element={<ManageKeyPage />} /> */}
              {/* <Route path="manage" element={<ManageKeyPage />} /> */}
              {/* <Route path="history/:keyId" element={<KeyHistoryPage />} /> */}
              {/* <Route path="history" element={<KeyHistoryPage />} /> */}
              <Route path=":keyId">
                <Route index element={<Navigate to="details" replace />} />
                <Route path="details" element={<KeyDetailPage />} />
                <Route path="history" element={<KeyHistoryPage />} />
              </Route>
            </Route>

            <Route path="/users/*" element={<UserManagementLayout />}>
              <Route index element={<Users />} />
              <Route path="add" element={<AddUserPage />} />
              <Route path="roles/:id" element={<EditUserRolePage />} />
              <Route path="roles" element={<EditUserRolePage />} />
            </Route>
          </Route>

          {/* Issuer routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin', 'issuer']}/>}>
            <Route element={<MainDashboardLayout />}>
              <Route path="/dashboard" element={<Dashboard/>} />
              <Route path="/exchange" element={<KeyExchangeStatus />} />
            </Route>
          </Route>
            

          {/* User routes */}
          <Route element={<ProtectedRoute/>}>
            <Route element={<MainDashboardLayout />}>
              <Route index element={<Navigate to="/user-dashboard" replace />} />
              <Route path="/user-dashboard" element={<UserDashboard />} />
              <Route path="/my-requests" element={<MyRequests />} />

            </Route>
          </Route>



            {/* <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Route> */}

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
