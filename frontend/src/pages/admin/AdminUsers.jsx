import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

const ROLE_LABELS = { admin: 'Admin', user: 'User', store_owner: 'Store Owner' };

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({ name: '', email: '', address: '', role: '' });
  const [sortBy, setSortBy] = useState('name');
  const [order, setOrder] = useState('ASC');
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(() => {
    setLoading(true);
    const params = { ...filters, sortBy, order };
    api.get('/admin/users', { params })
      .then(r => setUsers(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filters, sortBy, order]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setOrder(o => o === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(field);
      setOrder('ASC');
    }
  };

  const sortIcon = (field) => (
    <span className="sort-indicator">
      {sortBy === field ? (order === 'ASC' ? '↑' : '↓') : '↕'}
    </span>
  );

  return (
    <div style={{ animation: 'fadeInUp 0.4s ease' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Users</h1>
          <p className="page-subtitle">Manage all registered users</p>
        </div>
        <Link to="/admin/users/add" className="btn btn-primary">➕ Add User</Link>
      </div>

      <div className="filter-bar">
        {['name', 'email', 'address'].map(f => (
          <input
            key={f}
            id={`filter-${f}`}
            className="form-input"
            placeholder={`Filter by ${f}`}
            value={filters[f]}
            onChange={e => setFilters({ ...filters, [f]: e.target.value })}
          />
        ))}
        <select
          id="filter-role"
          className="form-select"
          value={filters.role}
          onChange={e => setFilters({ ...filters, role: e.target.value })}
        >
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="user">User</option>
          <option value="store_owner">Store Owner</option>
        </select>
      </div>

      {loading ? (
        <div className="loading"><div className="spinner"></div> Loading users...</div>
      ) : users.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">👤</div>
          <p>No users found</p>
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
                  { field: 'role', label: 'Role' },
                ].map(col => (
                  <th
                    key={col.field}
                    className={sortBy === col.field ? 'sorted' : ''}
                    onClick={() => handleSort(col.field)}
                  >
                    {col.label} {sortIcon(col.field)}
                  </th>
                ))}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
                  <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-secondary)' }}>{u.address}</td>
                  <td>
                    <span className={`badge badge-${u.role}`}>{ROLE_LABELS[u.role]}</span>
                  </td>
                  <td>
                    <Link to={`/admin/users/${u.id}`} className="btn btn-secondary btn-sm">View</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
