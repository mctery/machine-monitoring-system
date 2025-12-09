import mysql from 'mysql2/promise';

// Create connection for each request (better for serverless)
export async function getConnection() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'sql12.freesqldatabase.com',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'sql12811261',
    password: process.env.DB_PASSWORD || 'XTyz2XauKj',
    database: process.env.DB_NAME || 'sql12811261',
  });
  return connection;
}

export default { getConnection };
