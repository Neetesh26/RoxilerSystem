import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard')
      .then(r => setStats(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="loading"><div className="spinner"></div> Loading dashboard...</div>
  );

  const cards = [
    { icon: '👥', label: 'Total Users', value: stats?.totalUsers ?? 0 },
    { icon: '🏪', label: 'Total Stores', value: stats?.totalStores ?? 0 },
    { icon: '⭐', label: 'Total Ratings', value: stats?.totalRatings ?? 0 },
  ];

  return (
    <div style={{ animation: 'fadeInUp 0.4s ease' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Overview of platform activity</p>
        </div>
      </div>

      <div className="stats-grid">
        {cards.map((c) => (
          <div key={c.label} className="stat-card">
            <div className="stat-icon">{c.icon}</div>
            <div className="stat-value">{c.value.toLocaleString()}</div>
            <div className="stat-label">{c.label}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '8px', fontSize: '1rem', color: 'var(--text-secondary)' }}>Quick Actions</h3>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '16px' }}>
          <Link to="/admin/users/add" className="btn btn-primary">➕ Add User</Link>
          <Link to="/admin/stores/add" className="btn btn-secondary">🏪 Add Store</Link>
          <Link to="/admin/users" className="btn btn-secondary">👥 View Users</Link>
          <Link to="/admin/stores" className="btn btn-secondary">📋 View Stores</Link>
        </div>
      </div>
    </div>
  );
}
