import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';

const PWD_RE = /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$/;

export default function AddUser() {
  const [form, setForm] = useState({ name: '', email: '', password: '', address: '', role: 'user' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    const errs = {};
    if (!form.name || form.name.length < 20 || form.name.length > 60) errs.name = 'Name must be 20–60 characters';
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Valid email required';
    if (form.address.length > 400) errs.address = 'Max 400 characters';
    if (!PWD_RE.test(form.password)) errs.password = 'Password: 8-16 chars, 1 uppercase, 1 special character';
    if (!form.role) errs.role = 'Role required';
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
      await api.post('/admin/users', form);
      setSuccess('User created successfully!');
      setTimeout(() => navigate('/admin/users'), 1500);
    } catch (err) {
      setServerError(err.response?.data?.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  const set = (f) => (e) => setForm({ ...form, [f]: e.target.value });

  return (
    <div style={{ animation: 'fadeInUp 0.4s ease' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Add User</h1>
          <p className="page-subtitle">Create a new platform user</p>
        </div>
        <Link to="/admin/users" className="btn btn-secondary">← Back</Link>
      </div>

      <div className="card" style={{ maxWidth: 560 }}>
        {serverError && <div className="alert alert-error">⚠️ {serverError}</div>}
        {success && <div className="alert alert-success">✅ {success}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label">Full Name <span style={{color:'var(--text-muted)'}}>(20–60 chars)</span></label>
            <input id="add-user-name" className="form-input" type="text" placeholder="Full name"
              value={form.name} onChange={set('name')} />
            {errors.name && <p className="form-error">{errors.name}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input id="add-user-email" className="form-input" type="email" placeholder="Email address"
              value={form.email} onChange={set('email')} />
            {errors.email && <p className="form-error">{errors.email}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Address</label>
            <textarea id="add-user-address" className="form-textarea" placeholder="Full address"
              value={form.address} onChange={set('address')} rows={2} />
            {errors.address && <p className="form-error">{errors.address}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Password <span style={{color:'var(--text-muted)'}}>(8-16 chars, 1 uppercase, 1 special)</span></label>
            <input id="add-user-password" className="form-input" type="password" placeholder="Password"
              value={form.password} onChange={set('password')} />
            {errors.password && <p className="form-error">{errors.password}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Role</label>
            <select id="add-user-role" className="form-select" value={form.role} onChange={set('role')}>
              <option value="user">Normal User</option>
              <option value="admin">Admin</option>
              <option value="store_owner">Store Owner</option>
            </select>
            {errors.role && <p className="form-error">{errors.role}</p>}
          </div>

          <button id="add-user-submit" className="btn btn-primary btn-full" type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create User'}
          </button>
        </form>
      </div>
    </div>
  );
}
