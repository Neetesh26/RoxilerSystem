import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';

export default function AddStore() {
  const [form, setForm] = useState({ name: '', email: '', address: '', owner_id: '' });
  const [owners, setOwners] = useState([]);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/admin/users', { params: { role: 'store_owner' } })
      .then(r => setOwners(r.data))
      .catch(console.error);
  }, []);

  const validate = () => {
    const errs = {};
    if (!form.name || form.name.length < 20 || form.name.length > 60) errs.name = 'Name must be 20–60 characters';
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Valid email required';
    if (form.address.length > 400) errs.address = 'Max 400 characters';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setServerError('');
    setLoading(true);
    try {
      const payload = { ...form, owner_id: form.owner_id || undefined };
      await api.post('/admin/stores', payload);
      setSuccess('Store created successfully!');
      setTimeout(() => navigate('/admin/stores'), 1500);
    } catch (err) {
      setServerError(err.response?.data?.message || 'Failed to create store');
    } finally {
      setLoading(false);
    }
  };

  const set = (f) => (e) => setForm({ ...form, [f]: e.target.value });

  return (
    <div style={{ animation: 'fadeInUp 0.4s ease' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Add Store</h1>
          <p className="page-subtitle">Register a new store on the platform</p>
        </div>
        <Link to="/admin/stores" className="btn btn-secondary">← Back</Link>
      </div>

      <div className="card" style={{ maxWidth: 560 }}>
        {serverError && <div className="alert alert-error">⚠️ {serverError}</div>}
        {success && <div className="alert alert-success">✅ {success}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label">Store Name <span style={{color:'var(--text-muted)'}}>(20–60 chars)</span></label>
            <input id="add-store-name" className="form-input" type="text" placeholder="Store name"
              value={form.name} onChange={set('name')} />
            {errors.name && <p className="form-error">{errors.name}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input id="add-store-email" className="form-input" type="email" placeholder="store@example.com"
              value={form.email} onChange={set('email')} />
            {errors.email && <p className="form-error">{errors.email}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Address</label>
            <textarea id="add-store-address" className="form-textarea" placeholder="Full store address"
              value={form.address} onChange={set('address')} rows={2} />
            {errors.address && <p className="form-error">{errors.address}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Store Owner <span style={{color:'var(--text-muted)'}}>(optional)</span></label>
            <select id="add-store-owner" className="form-select" value={form.owner_id} onChange={set('owner_id')}>
              <option value="">No Owner</option>
              {owners.map(o => (
                <option key={o.id} value={o.id}>{o.name} ({o.email})</option>
              ))}
            </select>
          </div>

          <button id="add-store-submit" className="btn btn-primary btn-full" type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Store'}
          </button>
        </form>
      </div>
    </div>
  );
}
