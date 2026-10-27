require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const storeRoutes = require('./routes/stores');
const ownerRoutes = require('./routes/owner');

const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());


app.get('/api/health', (req, res) => res.json({ status: 'ok' }));


app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', storeRoutes);
app.use('/api/owner', ownerRoutes);


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
const pool = require('./config/db');

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  try {
    await pool.query('SELECT 1');
    console.log('MySQL connected');
  } catch (err) {
    console.error(pool.dbErrorMessage(err));
  }
});

module.exports = app;
