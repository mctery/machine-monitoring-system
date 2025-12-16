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

  let connection;
  try {
    connection = await getConnection();

    // Calculate week start (Monday) and month start
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - diffToMonday);
    weekStart.setHours(0, 0, 0, 0);

    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    monthStart.setHours(0, 0, 0, 0);

    const weekStartStr = weekStart.toISOString().slice(0, 19).replace('T', ' ');
    const monthStartStr = monthStart.toISOString().slice(0, 19).replace('T', ' ');

    // Get machine status with calculated weekly/monthly ratios
    const sql = `
      WITH latest_hours AS (
        SELECT mh1.*
        FROM machine_hours mh1
        INNER JOIN (
          SELECT machine_name, MAX(id) as max_id
          FROM machine_hours
          GROUP BY machine_name
        ) mh2 ON mh1.machine_name = mh2.machine_name AND mh1.id = mh2.max_id
      ),
      weekly_stats AS (
        SELECT
          machine_name,
          SUM(run_hour) as weekly_run,
          SUM(stop_hour) as weekly_stop
        FROM machine_hours
        WHERE log_time >= ?
        GROUP BY machine_name
      ),
      monthly_stats AS (
        SELECT
          machine_name,
          SUM(run_hour) as monthly_run,
          SUM(stop_hour) as monthly_stop
        FROM machine_hours
        WHERE log_time >= ?
        GROUP BY machine_name
      )
      SELECT
        ms.id,
        ms.machine_name as machineName,
        ms.group_name as groupName,
        ms.weekly_target as weeklyTarget,
        ms.monthly_target as monthlyTarget,
        lh.run_hour as runHour,
        lh.stop_hour as stopHour,
        lh.run_status as runStatus,
        lh.stop_status as stopStatus,
        lh.rework_status as reworkStatus,
        lh.log_time as logTime,
        ROUND(CASE
          WHEN (COALESCE(ws.weekly_run, 0) + COALESCE(ws.weekly_stop, 0)) > 0
          THEN (COALESCE(ws.weekly_run, 0) / (COALESCE(ws.weekly_run, 0) + COALESCE(ws.weekly_stop, 0))) * 100
          ELSE 0
        END, 2) as weeklyActualRatio,
        ROUND(CASE
          WHEN (COALESCE(ms2.monthly_run, 0) + COALESCE(ms2.monthly_stop, 0)) > 0
          THEN (COALESCE(ms2.monthly_run, 0) / (COALESCE(ms2.monthly_run, 0) + COALESCE(ms2.monthly_stop, 0))) * 100
          ELSE 0
        END, 2) as monthlyActualRatio
      FROM machine_settings ms
      LEFT JOIN latest_hours lh ON ms.machine_name = lh.machine_name
      LEFT JOIN weekly_stats ws ON ms.machine_name = ws.machine_name
      LEFT JOIN monthly_stats ms2 ON ms.machine_name = ms2.machine_name
      ORDER BY ms.group_name, ms.machine_name
    `;

    const [rows] = await connection.execute(sql, [weekStartStr, monthStartStr]);

    // Get unique groups for table splitting
    const groupsSql = `
      SELECT DISTINCT group_name as groupName
      FROM machine_settings
      ORDER BY group_name
    `;
    const [groupRows] = await connection.execute(groupsSql);
    const groups = (groupRows as { groupName: string }[]).map(r => r.groupName);

    return res.status(200).json({
      data: rows,
      groups,
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
