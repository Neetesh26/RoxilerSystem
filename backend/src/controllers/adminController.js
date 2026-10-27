const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const pool = require('../config/db');

// GET /api/admin/dashboard
const getDashboard = async (req, res) => {
  try {
    const [[{ totalUsers }]] = await pool.query('SELECT COUNT(*) as totalUsers FROM users');
    const [[{ totalStores }]] = await pool.query('SELECT COUNT(*) as totalStores FROM stores');
    const [[{ totalRatings }]] = await pool.query('SELECT COUNT(*) as totalRatings FROM ratings');
    res.json({ totalUsers, totalStores, totalRatings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/admin/users
const getUsers = async (req, res) => {
  try {
    const { name, email, address, role, sortBy = 'name', order = 'ASC' } = req.query;

    const allowedSortFields = ['name', 'email', 'address', 'role', 'created_at'];
    const safeSort = allowedSortFields.includes(sortBy) ? sortBy : 'name';
    const safeOrder = order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    let conditions = [];
    let params = [];

    if (name) { conditions.push('u.name LIKE ?'); params.push(`%${name}%`); }
    if (email) { conditions.push('u.email LIKE ?'); params.push(`%${email}%`); }
    if (address) { conditions.push('u.address LIKE ?'); params.push(`%${address}%`); }
    if (role) { conditions.push('u.role = ?'); params.push(role); }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const [rows] = await pool.query(
      `SELECT u.id, u.name, u.email, u.address, u.role, u.created_at,
        COALESCE(AVG(r.rating), NULL) as store_rating
       FROM users u
       LEFT JOIN stores s ON s.owner_id = u.id
       LEFT JOIN ratings r ON r.store_id = s.id
       ${where}
       GROUP BY u.id
       ORDER BY u.${safeSort} ${safeOrder}`,
      params
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/admin/users/:id
const getUserById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT u.id, u.name, u.email, u.address, u.role, u.created_at,
        COALESCE(AVG(r.rating), NULL) as store_rating
       FROM users u
       LEFT JOIN stores s ON s.owner_id = u.id
       LEFT JOIN ratings r ON r.store_id = s.id
       WHERE u.id = ?
       GROUP BY u.id`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'User not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/admin/users
const createUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  const { name, email, password, address, role } = req.body;

  try {
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashed, address, role]
    );

    res.status(201).json({ message: 'User created', id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/admin/stores
const getStores = async (req, res) => {
  try {
    const { name, email, address, sortBy = 'name', order = 'ASC' } = req.query;

    const allowedSortFields = ['name', 'email', 'address', 'avg_rating', 'created_at'];
    const safeSort = allowedSortFields.includes(sortBy) ? sortBy : 'name';
    const safeOrder = order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    let conditions = [];
    let params = [];

    if (name) { conditions.push('s.name LIKE ?'); params.push(`%${name}%`); }
    if (email) { conditions.push('s.email LIKE ?'); params.push(`%${email}%`); }
    if (address) { conditions.push('s.address LIKE ?'); params.push(`%${address}%`); }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const [rows] = await pool.query(
      `SELECT s.id, s.name, s.email, s.address, s.owner_id,
        COALESCE(AVG(r.rating), 0) as avg_rating,
        u.name as owner_name
       FROM stores s
       LEFT JOIN ratings r ON r.store_id = s.id
       LEFT JOIN users u ON u.id = s.owner_id
       ${where}
       GROUP BY s.id
       ORDER BY ${safeSort === 'avg_rating' ? 'avg_rating' : `s.${safeSort}`} ${safeOrder}`,
      params
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/admin/stores
const createStore = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  const { name, email, address, owner_id } = req.body;

  try {
    const [existing] = await pool.query('SELECT id FROM stores WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ message: 'Store email already exists' });
    }

    if (owner_id) {
      const [ownerRows] = await pool.query('SELECT id, role FROM users WHERE id = ?', [owner_id]);
      if (ownerRows.length === 0) return res.status(404).json({ message: 'Owner not found' });
      if (ownerRows[0].role !== 'store_owner') {
        return res.status(400).json({ message: 'Selected user must have the store_owner role' });
      }
    }

    const [result] = await pool.query(
      'INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)',
      [name, email, address, owner_id || null]
    );

    res.status(201).json({ message: 'Store created', id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getDashboard, getUsers, getUserById, createUser, getStores, createStore };
