import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/axios';
import { RatingDisplay } from '../../components/StarRating';

const ROLE_LABELS = { admin: 'System Admin', user: 'Normal User', store_owner: 'Store Owner' };

export default function AdminUserDetail() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/admin/users/${id}`)
      .then(r => setUser(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="loading"><div className="spinner"></div> Loading user...</div>;
  if (!user) return <div className="empty-state"><p>User not found</p></div>;

  return (
    <div style={{ animation: 'fadeInUp 0.4s ease' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">User Detail</h1>
          <p className="page-subtitle">Full profile information</p>
        </div>
        <Link to="/admin/users" className="btn btn-secondary">← Back to Users</Link>
      </div>

      <div className="card user-detail-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.5rem', fontWeight: 700, color: '#fff',
          }}>
            {user.name[0].toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{user.name}</div>
            <span className={`badge badge-${user.role}`}>{ROLE_LABELS[user.role]}</span>
          </div>
        </div>

        {[
          { label: 'Email', value: user.email },
          { label: 'Address', value: user.address },
          { label: 'Role', value: ROLE_LABELS[user.role] },
          { label: 'Joined', value: new Date(user.created_at).toLocaleDateString() },
        ].map(({ label, value }) => (
          <div key={label} className="detail-row">
            <span className="detail-label">{label}</span>
            <span className="detail-value">{value}</span>
          </div>
        ))}

        {user.role === 'store_owner' && (
          <div className="detail-row">
            <span className="detail-label">Store Rating</span>
            <span className="detail-value">
              {user.store_rating != null
                ? <RatingDisplay value={user.store_rating} />
                : <span style={{ color: 'var(--text-muted)' }}>No ratings yet</span>
              }
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
