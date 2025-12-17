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
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { from, to } = req.query;

  if (!from || !to) {
    return res.status(400).json({ error: 'Missing required parameters: from, to' });
  }

  let connection;
  try {
    connection = await getConnection();

    const fromDate = new Date(from as string);
    const toDate = new Date(to as string);

    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
      return res.status(400).json({ error: 'Invalid date format' });
    }

    const fromStr = fromDate.toISOString().slice(0, 19).replace('T', ' ');
    const toStr = toDate.toISOString().slice(0, 19).replace('T', ' ');

    // Get individual machine_hours records for timeline segments
    const sql = `
      SELECT
        mh.id,
        mh.machine_name as machineName,
        mh.log_time as logTime,
        mh.run_hour as runHour,
        mh.stop_hour as stopHour,
        mh.run_status as runStatus,
        mh.stop_status as stopStatus,
        ms.group_name as groupName
      FROM machine_hours mh
      LEFT JOIN machine_settings ms ON mh.machine_name = ms.machine_name
      WHERE mh.log_time >= ? AND mh.log_time <= ?
      ORDER BY mh.machine_name, mh.log_time ASC
    `;

    const [rows] = await connection.execute(sql, [fromStr, toStr]);

    return res.status(200).json({
      data: rows,
      count: (rows as unknown[]).length
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
