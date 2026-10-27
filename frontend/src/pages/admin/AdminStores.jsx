import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { RatingDisplay } from '../../components/StarRating';

export default function AdminStores() {
  const [stores, setStores] = useState([]);
  const [filters, setFilters] = useState({ name: '', email: '', address: '' });
  const [sortBy, setSortBy] = useState('name');
  const [order, setOrder] = useState('ASC');
  const [loading, setLoading] = useState(true);

  const fetchStores = useCallback(() => {
    setLoading(true);
    api.get('/admin/stores', { params: { ...filters, sortBy, order } })
      .then(r => setStores(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filters, sortBy, order]);

  useEffect(() => { fetchStores(); }, [fetchStores]);

  const handleSort = (field) => {
    if (sortBy === field) setOrder(o => o === 'ASC' ? 'DESC' : 'ASC');
    else { setSortBy(field); setOrder('ASC'); }
  };

  const sortIcon = (f) => (
    <span className="sort-indicator">{sortBy === f ? (order === 'ASC' ? '↑' : '↓') : '↕'}</span>
  );

  return (
    <div style={{ animation: 'fadeInUp 0.4s ease' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Stores</h1>
          <p className="page-subtitle">All registered stores on the platform</p>
        </div>
        <Link to="/admin/stores/add" className="btn btn-primary">➕ Add Store</Link>
      </div>

      <div className="filter-bar">
        {['name', 'email', 'address'].map(f => (
          <input key={f} id={`store-filter-${f}`} className="form-input"
            placeholder={`Filter by ${f}`} value={filters[f]}
            onChange={e => setFilters({ ...filters, [f]: e.target.value })} />
        ))}
      </div>

      {loading ? (
        <div className="loading"><div className="spinner"></div> Loading stores...</div>
      ) : stores.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🏪</div>
          <p>No stores found</p>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                {[
                  { field: 'name', label: 'Name' },
                  { field: 'email', label: 'Email' },
                  { field: 'address', label: 'Address' },
                  { field: 'avg_rating', label: 'Rating' },
                ].map(col => (
                  <th key={col.field}
                    className={sortBy === col.field ? 'sorted' : ''}
                    onClick={() => handleSort(col.field)}>
                    {col.label} {sortIcon(col.field)}
                  </th>
                ))}
                <th>Owner</th>
              </tr>
            </thead>
            <tbody>
              {stores.map(s => (
                <tr key={s.id}>
                  <td style={{ fontWeight: 600 }}>{s.name}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{s.email}</td>
                  <td style={{ color: 'var(--text-secondary)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.address}</td>
                  <td><RatingDisplay value={s.avg_rating} /></td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{s.owner_name || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
