import type { VercelRequest, VercelResponse } from '@vercel/node';
import mysql from 'mysql2/promise';

function validateEnvVars() {
  const required = ['DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
  const missing = required.filter(key => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

async function getConnection() {
  validateEnvVars();
  return mysql.createConnection({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT!),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: {}
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let connection;
  try {
    connection = await getConnection();

    // Clear all records from machine_hours table
    const [result] = await connection.execute('DELETE FROM machine_hours');
    const affectedRows = (result as { affectedRows: number }).affectedRows;

    return res.status(200).json({
      message: 'machine_hours table cleared successfully',
      deletedCount: affectedRows
    });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}
