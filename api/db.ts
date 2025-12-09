import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'sql12.freesqldatabase.com',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'sql12811261',
  password: process.env.DB_PASSWORD || 'XTyz2XauKj',
  database: process.env.DB_NAME || 'sql12811261',
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0
});

export default pool;
