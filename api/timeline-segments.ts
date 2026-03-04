import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getConnection, setCORS, parseDateParam, errorMessage } from './_db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCORS(res);

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { from, to } = req.query;
  if (!from || !to) {
    return res.status(400).json({ error: 'Missing required parameters: from, to' });
  }

  const fromStr = parseDateParam(from as string);
  const toStr = parseDateParam(to as string);
  if (!fromStr) return res.status(400).json({ error: 'Invalid from date format' });
  if (!toStr) return res.status(400).json({ error: 'Invalid to date format' });

  let connection;
  try {
    connection = await getConnection();

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
        mh.rework_status as reworkStatus,
        ms.group_name as groupName
      FROM machine_hours mh
      LEFT JOIN machine_settings ms ON mh.machine_name = ms.machine_name
      WHERE mh.log_time >= ? AND mh.log_time <= ?
      ORDER BY mh.machine_name, mh.log_time ASC
    `;

    const [rows] = await connection.execute(sql, [fromStr, toStr]);

    // Convert DECIMAL fields to numbers
    const data = (rows as Array<{
      id: number;
      machineName: string;
      logTime: Date;
      runHour: string | number;
      stopHour: string | number;
      runStatus: number;
      stopStatus: number;
      reworkStatus: number | null;
      groupName: string;
    }>).map(row => ({
      id: row.id,
      machineName: row.machineName,
      groupName: row.groupName,
      logTime: row.logTime,
      runHour: Number(row.runHour) || 0,
      stopHour: Number(row.stopHour) || 0,
      runStatus: row.runStatus,
      stopStatus: row.stopStatus,
      reworkStatus: row.reworkStatus
    }));

    return res.status(200).json({
      data,
      count: data.length
    });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error', message: errorMessage(error) });
  } finally {
    if (connection) await connection.end();
  }
}
