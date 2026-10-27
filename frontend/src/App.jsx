import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedLayout from './components/ProtectedLayout';

import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminUserDetail from './pages/admin/AdminUserDetail';
import AddUser from './pages/admin/AddUser';
import AdminStores from './pages/admin/AdminStores';
import AddStore from './pages/admin/AddStore';

import UserStores from './pages/user/UserStores';

import OwnerDashboard from './pages/owner/OwnerDashboard';

import ChangePassword from './pages/shared/ChangePassword';

function RootRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  if (user.role === 'store_owner') return <Navigate to="/owner/dashboard" replace />;
  return <Navigate to="/user/stores" replace />;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<RootRedirect />} />

          {/* Admin routes */}
          <Route element={<ProtectedLayout allowedRoles={['admin']} />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/users/add" element={<AddUser />} />
            <Route path="/admin/users/:id" element={<AdminUserDetail />} />
            <Route path="/admin/stores" element={<AdminStores />} />
            <Route path="/admin/stores/add" element={<AddStore />} />
          </Route>

          {/* Normal user routes */}
          <Route element={<ProtectedLayout allowedRoles={['user']} />}>
            <Route path="/user/stores" element={<UserStores />} />
            <Route path="/user/password" element={<ChangePassword />} />
          </Route>

          {/* Store owner routes */}
          <Route element={<ProtectedLayout allowedRoles={['store_owner']} />}>
            <Route path="/owner/dashboard" element={<OwnerDashboard />} />
            <Route path="/owner/password" element={<ChangePassword />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
