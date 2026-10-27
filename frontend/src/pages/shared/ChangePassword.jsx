import { useState } from 'react';
import api from '../../api/axios';

const PWD_RE = /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$/;

export default function ChangePassword() {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs = {};
    if (!form.currentPassword) errs.currentPassword = 'Current password required';
    if (!PWD_RE.test(form.newPassword)) errs.newPassword = 'Password: 8-16 chars, 1 uppercase, 1 special character';
    if (form.newPassword !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
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
      await api.put('/auth/password', {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      setSuccess('Password updated successfully!');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setServerError(err.response?.data?.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const set = (f) => (e) => setForm({ ...form, [f]: e.target.value });

  return (
    <div style={{ animation: 'fadeInUp 0.4s ease' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Change Password</h1>
          <p className="page-subtitle">Update your account password</p>
        </div>
      </div>

      <div className="card" style={{ maxWidth: 480 }}>
        {serverError && <div className="alert alert-error">⚠️ {serverError}</div>}
        {success && <div className="alert alert-success">✅ {success}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label">Current Password</label>
            <input id="current-password" className="form-input" type="password"
              placeholder="Your current password"
              value={form.currentPassword} onChange={set('currentPassword')} />
            {errors.currentPassword && <p className="form-error">{errors.currentPassword}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">New Password <span style={{color:'var(--text-muted)'}}>(8-16 chars, 1 uppercase, 1 special)</span></label>
            <input id="new-password" className="form-input" type="password"
              placeholder="New strong password"
              value={form.newPassword} onChange={set('newPassword')} />
            {errors.newPassword && <p className="form-error">{errors.newPassword}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Confirm New Password</label>
            <input id="confirm-password" className="form-input" type="password"
              placeholder="Repeat new password"
              value={form.confirmPassword} onChange={set('confirmPassword')} />
            {errors.confirmPassword && <p className="form-error">{errors.confirmPassword}</p>}
          </div>

          <button id="change-password-submit" className="btn btn-primary btn-full" type="submit" disabled={loading}>
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
