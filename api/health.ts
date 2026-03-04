import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getConnection, setCORS, errorMessage } from './_db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCORS(res);

  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  let connection;
  try {
    connection = await getConnection();
    await connection.execute('SELECT 1');
    return res.status(200).json({ status: 'healthy', database: 'connected', timestamp: new Date().toISOString() });
  } catch (error) {
    return res.status(500).json({ status: 'unhealthy', database: 'error', error: errorMessage(error), timestamp: new Date().toISOString() });
  } finally {
    if (connection) await connection.end();
  }
}
