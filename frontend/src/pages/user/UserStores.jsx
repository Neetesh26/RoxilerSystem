import { useState, useEffect, useCallback } from 'react';
import api from '../../api/axios';
import { StarRating, RatingDisplay } from '../../components/StarRating';

function RatingModal({ store, currentRating, onClose, onSuccess }) {
  const [rating, setRating] = useState(currentRating || 0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!rating) { setError('Please select a rating'); return; }
    setLoading(true);
    try {
      if (currentRating) {
        await api.put(`/ratings/${store.id}`, { rating });
      } else {
        await api.post('/ratings', { store_id: store.id, rating });
      }
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit rating');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{currentRating ? 'Update Rating' : 'Rate Store'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <p style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>
          {store.name}
        </p>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          Tap a star to select your rating
        </p>

        <div className="rating-stars-big">
          {[1,2,3,4,5].map(s => (
            <span key={s}
              className={`star ${s <= rating ? 'filled' : ''}`}
              onClick={() => setRating(s)}
              style={{ fontSize: '2.5rem', cursor: 'pointer', transition: 'transform 0.15s' }}
            >★</span>
          ))}
        </div>

        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '20px', fontWeight: 600 }}>
          {rating ? `${rating} out of 5` : 'No rating selected'}
        </p>

        {error && <div className="alert alert-error">⚠️ {error}</div>}

        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
          <button id="rating-submit-btn" className="btn btn-primary" style={{ flex: 1 }}
            onClick={handleSubmit} disabled={loading || !rating}>
            {loading ? 'Submitting...' : currentRating ? 'Update Rating' : 'Submit Rating'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function UserStores() {
  const [stores, setStores] = useState([]);
  const [filters, setFilters] = useState({ name: '', address: '' });
  const [sortBy, setSortBy] = useState('name');
  const [order, setOrder] = useState('ASC');
  const [loading, setLoading] = useState(true);
  const [ratingModal, setRatingModal] = useState(null);

  const fetchStores = useCallback(() => {
    setLoading(true);
    api.get('/stores', { params: { ...filters, sortBy, order } })
      .then(r => setStores(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filters, sortBy, order]);

  useEffect(() => { fetchStores(); }, [fetchStores]);

  const handleSort = (f) => {
    if (sortBy === f) setOrder(o => o === 'ASC' ? 'DESC' : 'ASC');
    else { setSortBy(f); setOrder('ASC'); }
  };

  const handleRatingSuccess = () => {
    setRatingModal(null);
    fetchStores();
  };

  return (
    <div style={{ animation: 'fadeInUp 0.4s ease' }}>
      {ratingModal && (
        <RatingModal
          store={ratingModal}
          currentRating={ratingModal.user_rating}
          onClose={() => setRatingModal(null)}
          onSuccess={handleRatingSuccess}
        />
      )}

      <div className="page-header">
        <div>
          <h1 className="page-title">Browse Stores</h1>
          <p className="page-subtitle">Discover and rate stores on the platform</p>
        </div>
      </div>

      <div className="filter-bar">
        <input id="store-search-name" className="form-input" placeholder="Search by name..."
          value={filters.name} onChange={e => setFilters({ ...filters, name: e.target.value })} />
        <input id="store-search-address" className="form-input" placeholder="Search by address..."
          value={filters.address} onChange={e => setFilters({ ...filters, address: e.target.value })} />
        <select id="store-sort" className="form-select"
          value={`${sortBy}-${order}`}
          onChange={e => {
            const [f, o] = e.target.value.split('-');
            setSortBy(f); setOrder(o);
          }}>
          <option value="name-ASC">Name A→Z</option>
          <option value="name-DESC">Name Z→A</option>
          <option value="avg_rating-DESC">Highest Rated</option>
          <option value="avg_rating-ASC">Lowest Rated</option>
          <option value="address-ASC">Address A→Z</option>
        </select>
      </div>

      {loading ? (
        <div className="loading"><div className="spinner"></div> Loading stores...</div>
      ) : stores.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🏪</div>
          <p>No stores found</p>
        </div>
      ) : (
        <div className="stores-grid">
          {stores.map(store => (
            <div key={store.id} className="store-card">
              <div className="store-card-header">
                <div className="store-avatar">{store.name[0].toUpperCase()}</div>
                <div style={{ flex: 1, marginLeft: '14px' }}>
                  <div className="store-name">{store.name}</div>
                  <div className="store-address">📍 {store.address}</div>
                </div>
              </div>

              <div className="store-rating-row">
                <div>
                  <div className="rating-label">Overall Rating</div>
                  <div className="rating-value">
                    <RatingDisplay value={store.avg_rating} />
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="rating-label">Your Rating</div>
                  <div className="rating-value">
                    {store.user_rating
                      ? <StarRating value={store.user_rating} />
                      : <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Not rated</span>
                    }
                  </div>
                </div>
              </div>

              <button
                id={`rate-store-${store.id}`}
                className={`btn ${store.user_rating ? 'btn-secondary' : 'btn-primary'} btn-full btn-sm`}
                onClick={() => setRatingModal(store)}
              >
                {store.user_rating ? '✏️ Modify Rating' : '⭐ Rate This Store'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
