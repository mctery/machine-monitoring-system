import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getConnection } from './_db';

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
    return res.status(400).json({ error: 'from and to query parameters are required' });
  }

  let connection;
  try {
    connection = await getConnection();

    const [rows] = await connection.execute(
      `SELECT machine_name, log_time FROM machine_hours WHERE log_time >= ? AND log_time <= ? ORDER BY machine_name, log_time`,
      [String(from), String(to)]
    );

    const data = (rows as { machine_name: string; log_time: Date }[]).map(row => ({
      machineName: row.machine_name,
      logTime: row.log_time,
    }));

    return res.status(200).json({ data, count: data.length });
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
