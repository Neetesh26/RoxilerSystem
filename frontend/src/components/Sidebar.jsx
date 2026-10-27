import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = {
  admin: [
    { to: '/admin/dashboard', icon: '📊', label: 'Dashboard' },
    { to: '/admin/users', icon: '👥', label: 'Users' },
    { to: '/admin/stores', icon: '🏪', label: 'Stores' },
    { to: '/admin/users/add', icon: '➕', label: 'Add User' },
    { to: '/admin/stores/add', icon: '➕', label: 'Add Store' },
  ],
  user: [
    { to: '/user/stores', icon: '🏪', label: 'Browse Stores' },
    { to: '/user/password', icon: '🔑', label: 'Change Password' },
  ],
  store_owner: [
    { to: '/owner/dashboard', icon: '📊', label: 'Dashboard' },
    { to: '/owner/password', icon: '🔑', label: 'Change Password' },
  ],
};

const roleLabels = {
  admin: 'System Admin',
  user: 'Normal User',
  store_owner: 'Store Owner',
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const items = navItems[user?.role] || [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h2>⭐ Roxiler</h2>
        <p>Store Rating Platform</p>
      </div>

      <nav className="sidebar-nav">
        <div style={{ padding: '8px 14px', marginBottom: '8px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '2px' }}>
            Logged in as
          </div>
          <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            {user?.name?.split(' ')[0]}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--accent-primary)' }}>
            {roleLabels[user?.role]}
          </div>
        </div>

        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="nav-item" onClick={handleLogout}>
          <span className="nav-icon">🚪</span>
          Logout
        </button>
      </div>
    </aside>
  );
}
