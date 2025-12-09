import type { VercelRequest, VercelResponse } from '@vercel/node';
import mysql from 'mysql2/promise';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com',
      port: parseInt(process.env.DB_PORT || '4000'),
      user: process.env.DB_USER || '36z4FEVBxiY23rD.root',
      password: process.env.DB_PASSWORD || 'cLzLY9myzgEmww03',
      database: process.env.DB_NAME || 'test',
      ssl: {}
    });

    await connection.execute('SELECT 1');

    return res.status(200).json({
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return res.status(500).json({
      status: 'unhealthy',
      database: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}
