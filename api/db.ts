import mysql from 'mysql2/promise';

// Create connection for each request (better for serverless)
export async function getConnection() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com',
    port: parseInt(process.env.DB_PORT || '4000'),
    user: process.env.DB_USER || '36z4FEVBxiY23rD.root',
    password: process.env.DB_PASSWORD || 'uOA3PJz4MTMvMkcW',
    database: process.env.DB_NAME || 'test',
    ssl: {}
  });
  return connection;
}

export default { getConnection };
