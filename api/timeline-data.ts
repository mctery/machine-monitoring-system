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

    // Ratio calculation: actualRatio1 = trueRatio1 (no warning data to differentiate)
    const sql = `
      WITH range_stats AS (
        SELECT
          mh.machine_name,
          SUM(mh.run_hour) as total_run,
          SUM(mh.stop_hour) as total_stop
        FROM machine_hours mh
        WHERE mh.log_time >= ? AND mh.log_time <= ?
        GROUP BY mh.machine_name
      )
      SELECT
        ms.machine_name as machineName,
        ms.group_name as groupName,
        ms.weekly_target as weeklyTarget,
        ms.monthly_target as monthlyTarget,
        COALESCE(rs.total_run, 0) as runHour,
        COALESCE(rs.total_stop, 0) as stopHour,
        ROUND(CASE
          WHEN (COALESCE(rs.total_run, 0) + COALESCE(rs.total_stop, 0)) > 0
          THEN (COALESCE(rs.total_run, 0) / (COALESCE(rs.total_run, 0) + COALESCE(rs.total_stop, 0))) * 100
          ELSE 0
        END, 2) as ratio
      FROM machine_settings ms
      LEFT JOIN range_stats rs ON ms.machine_name = rs.machine_name
      ORDER BY ms.group_name, ms.machine_name
    `;

    const [rows] = await connection.execute(sql, [fromStr, toStr]);

    const data = (rows as Array<{
      machineName: string;
      groupName: string;
      weeklyTarget: string | number;
      monthlyTarget: string | number;
      runHour: string | number;
      stopHour: string | number;
      ratio: string | number;
    }>).map(row => ({
      machineName: row.machineName,
      groupName: row.groupName,
      weeklyTarget: Number(row.weeklyTarget) || 0,
      monthlyTarget: Number(row.monthlyTarget) || 0,
      runHour: Number(row.runHour) || 0,
      stopHour: Number(row.stopHour) || 0,
      actualRatio1: Number(row.ratio) || 0,
      trueRatio1: Number(row.ratio) || 0
    }));

    return res.status(200).json({ data, count: data.length });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error', message: errorMessage(error) });
  } finally {
    if (connection) await connection.end();
  }
}
