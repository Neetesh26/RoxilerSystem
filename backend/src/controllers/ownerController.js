const pool = require('../config/db');

// GET /api/owner/dashboard
const getOwnerDashboard = async (req, res) => {
  try {
    const ownerId = req.user.id;

    // Get the store owned by this user
    const [storeRows] = await pool.query(
      'SELECT id, name, email, address FROM stores WHERE owner_id = ?',
      [ownerId]
    );

    if (storeRows.length === 0) {
      return res.json({ store: null, avgRating: 0, raters: [] });
    }

    const store = storeRows[0];

    // Get average rating
    const [[{ avgRating }]] = await pool.query(
      'SELECT COALESCE(AVG(rating), 0) as avgRating FROM ratings WHERE store_id = ?',
      [store.id]
    );

    // Get list of users who rated
    const [raters] = await pool.query(
      `SELECT u.id, u.name, u.email, r.rating, r.updated_at as rated_at
       FROM ratings r
       JOIN users u ON u.id = r.user_id
       WHERE r.store_id = ?
       ORDER BY r.updated_at DESC`,
      [store.id]
    );

    res.json({ store, avgRating: parseFloat(avgRating).toFixed(2), raters });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getOwnerDashboard };
