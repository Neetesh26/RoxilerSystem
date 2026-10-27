import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { RatingDisplay } from '../../components/StarRating';

export default function OwnerDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState('rated_at');
  const [sortOrder, setSortOrder] = useState('DESC');

  useEffect(() => {
    api.get('/owner/dashboard')
      .then(r => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading"><div className="spinner"></div> Loading dashboard...</div>;
  if (!data) return null;

  const { store, avgRating, raters } = data;

  const handleSort = (f) => {
    if (sortField === f) setSortOrder(o => o === 'ASC' ? 'DESC' : 'ASC');
    else { setSortField(f); setSortOrder('ASC'); }
  };

  const sortIcon = (f) => (
    <span className="sort-indicator">{sortField === f ? (sortOrder === 'ASC' ? '↑' : '↓') : '↕'}</span>
  );

  const sortedRaters = [...raters].sort((a, b) => {
    let va = a[sortField], vb = b[sortField];
    if (typeof va === 'string') va = va.toLowerCase();
    if (typeof vb === 'string') vb = vb.toLowerCase();
    if (va < vb) return sortOrder === 'ASC' ? -1 : 1;
    if (va > vb) return sortOrder === 'ASC' ? 1 : -1;
    return 0;
  });

  return (
    <div style={{ animation: 'fadeInUp 0.4s ease' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Store Dashboard</h1>
          <p className="page-subtitle">
            {store ? store.name : 'No store assigned'}
          </p>
        </div>
      </div>

      {!store ? (
        <div className="empty-state">
          <div className="empty-icon">🏪</div>
          <p>No store has been assigned to your account yet.</p>
        </div>
      ) : (
        <>
          <div className="owner-avg-rating">
            <div>
              <div className="avg-number">{avgRating}</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '4px' }}>Average Rating</div>
            </div>
            <div style={{ flex: 1, paddingLeft: '24px', borderLeft: '1px solid var(--border)' }}>
              <RatingDisplay value={avgRating} />
              <div style={{ marginTop: '12px', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                Based on <strong>{raters.length}</strong> {raters.length === 1 ? 'rating' : 'ratings'}
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '4px' }}>
                📍 {store.address}
              </div>
            </div>
          </div>

          <div className="page-header" style={{ marginBottom: '16px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Customer Ratings</h2>
          </div>

          {raters.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">⭐</div>
              <p>No ratings yet. Ratings will appear here once customers submit them.</p>
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    {[
                      { f: 'name', label: 'Customer Name' },
                      { f: 'email', label: 'Email' },
                      { f: 'rating', label: 'Rating' },
                      { f: 'rated_at', label: 'Date' },
                    ].map(col => (
                      <th key={col.f}
                        className={sortField === col.f ? 'sorted' : ''}
                        onClick={() => handleSort(col.f)}>
                        {col.label} {sortIcon(col.f)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sortedRaters.map(r => (
                    <tr key={r.id}>
                      <td style={{ fontWeight: 600 }}>{r.name}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{r.email}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ color: '#f59e0b', fontSize: '1.1rem' }}>
                            {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                          </span>
                          <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                            {r.rating}/5
                          </span>
                        </div>
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                        {new Date(r.rated_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
