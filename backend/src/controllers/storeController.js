const { validationResult } = require('express-validator');
const pool = require('../config/db');

// GET /api/stores
const getStores = async (req, res) => {
  try {
    const { name, address, sortBy = 'name', order = 'ASC' } = req.query;
    const userId = req.user.id;

    const allowedSortFields = ['name', 'address', 'avg_rating'];
    const safeSort = allowedSortFields.includes(sortBy) ? sortBy : 'name';
    const safeOrder = order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    let conditions = [];
    let params = [userId];

    if (name) { conditions.push('s.name LIKE ?'); params.push(`%${name}%`); }
    if (address) { conditions.push('s.address LIKE ?'); params.push(`%${address}%`); }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const [rows] = await pool.query(
      `SELECT s.id, s.name, s.address, s.email,
        COALESCE(AVG(r.rating), 0) as avg_rating,
        ur.rating as user_rating
       FROM stores s
       LEFT JOIN ratings r ON r.store_id = s.id
       LEFT JOIN ratings ur ON ur.store_id = s.id AND ur.user_id = ?
       ${where}
       GROUP BY s.id, ur.rating
       ORDER BY ${safeSort === 'avg_rating' ? 'avg_rating' : `s.${safeSort}`} ${safeOrder}`,
      params
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/ratings
const submitRating = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  const { store_id, rating } = req.body;
  const userId = req.user.id;

  try {
    const [storeRows] = await pool.query('SELECT id FROM stores WHERE id = ?', [store_id]);
    if (storeRows.length === 0) return res.status(404).json({ message: 'Store not found' });

    await pool.query(
      'INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE rating = ?, updated_at = CURRENT_TIMESTAMP',
      [userId, store_id, rating, rating]
    );

    res.json({ message: 'Rating submitted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/ratings/:storeId
const updateRating = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  const { storeId } = req.params;
  const { rating } = req.body;
  const userId = req.user.id;

  try {
    const [existing] = await pool.query(
      'SELECT id FROM ratings WHERE user_id = ? AND store_id = ?',
      [userId, storeId]
    );
    if (existing.length === 0) {
      return res.status(404).json({ message: 'No rating found to update' });
    }

    await pool.query(
      'UPDATE ratings SET rating = ? WHERE user_id = ? AND store_id = ?',
      [rating, userId, storeId]
    );

    res.json({ message: 'Rating updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getStores, submitRating, updateRating };
