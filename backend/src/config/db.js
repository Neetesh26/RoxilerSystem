require('dotenv').config();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

function dbErrorMessage(err) {
  if (err?.code === 'ER_ACCESS_DENIED_ERROR') {
    return 'Cannot connect to MySQL. Set DB_PASSWORD in backend/.env to your real MySQL root password, then restart the server.';
  }
  if (err?.code === 'ER_BAD_DB_ERROR') {
    return 'Database roxiler_system does not exist. Run backend/src/config/schema.sql in MySQL Workbench.';
  }
  if (err?.code === 'ECONNREFUSED') {
    return 'MySQL is not running. Start MySQL from Windows services, then try again.';
  }
  return 'Server error';
}

module.exports = pool;
module.exports.dbErrorMessage = dbErrorMessage;
