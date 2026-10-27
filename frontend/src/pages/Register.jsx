import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const PWD_RE = /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$/;

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', address: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const errs = {};
    if (!form.name || form.name.length < 20 || form.name.length > 60)
      errs.name = 'Name must be 20–60 characters';
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = 'Valid email required';
    if (form.address.length > 400)
      errs.address = 'Address must be max 400 characters';
    if (!PWD_RE.test(form.password))
      errs.password = 'Password: 8-16 chars, 1 uppercase, 1 special character';
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
      const res = await api.post('/auth/register', form);
      login(res.data.user, res.data.token);
      navigate('/user/stores');
    } catch (err) {
      setServerError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <h1>⭐ Roxiler</h1>
          <p>Create your account</p>
        </div>

        {serverError && <div className="alert alert-error">⚠️ {serverError}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label">Full Name <span style={{color:'var(--text-muted)'}}>(20–60 chars)</span></label>
            <input id="reg-name" className="form-input" type="text" placeholder="Your full name"
              value={form.name} onChange={set('name')} />
            {errors.name && <p className="form-error">{errors.name}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input id="reg-email" className="form-input" type="email" placeholder="you@example.com"
              value={form.email} onChange={set('email')} autoComplete="email" />
            {errors.email && <p className="form-error">{errors.email}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Address <span style={{color:'var(--text-muted)'}}>(max 400 chars)</span></label>
            <textarea id="reg-address" className="form-textarea" placeholder="Your address"
              value={form.address} onChange={set('address')} rows={2} />
            {errors.address && <p className="form-error">{errors.address}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Password <span style={{color:'var(--text-muted)'}}>(8-16 chars, 1 uppercase, 1 special)</span></label>
            <input id="reg-password" className="form-input" type="password" placeholder="Create a strong password"
              value={form.password} onChange={set('password')} autoComplete="new-password" />
            {errors.password && <p className="form-error">{errors.password}</p>}
          </div>

          <button id="reg-submit" className="btn btn-primary btn-full" type="submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="mt-24 text-center" style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          Already have an account?{' '}
          <Link to="/login" className="link">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
