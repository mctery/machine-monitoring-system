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

  // Validate date params
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

    // Get timeline data with date range filter
    // Join machine_hours with machine_settings to get group and target info
    const sql = `
      WITH range_stats AS (
        SELECT
          mh.machine_name,
          SUM(mh.run_hour) as total_run,
          SUM(mh.stop_hour) as total_stop,
          SUM(COALESCE(mh.warning_hour, 0)) as total_warning
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
        COALESCE(rs.total_warning, 0) as warningHour,
        -- Actual Ratio 1 = (Run / (Run + Stop)) * 100
        ROUND(CASE
          WHEN (COALESCE(rs.total_run, 0) + COALESCE(rs.total_stop, 0)) > 0
          THEN (COALESCE(rs.total_run, 0) / (COALESCE(rs.total_run, 0) + COALESCE(rs.total_stop, 0))) * 100
          ELSE 0
        END, 2) as actualRatio1,
        -- True Ratio 1 = ((Run - Warning) / (Run + Stop)) * 100
        ROUND(CASE
          WHEN (COALESCE(rs.total_run, 0) + COALESCE(rs.total_stop, 0)) > 0
          THEN ((COALESCE(rs.total_run, 0) - COALESCE(rs.total_warning, 0)) / (COALESCE(rs.total_run, 0) + COALESCE(rs.total_stop, 0))) * 100
          ELSE 0
        END, 2) as trueRatio1
      FROM machine_settings ms
      LEFT JOIN range_stats rs ON ms.machine_name = rs.machine_name
      ORDER BY ms.group_name, ms.machine_name
    `;

    const [rows] = await connection.execute(sql, [fromStr, toStr]);

    // Convert DECIMAL fields to numbers
    const data = (rows as Array<{
      machineName: string;
      groupName: string;
      weeklyTarget: string | number;
      monthlyTarget: string | number;
      runHour: string | number;
      stopHour: string | number;
      warningHour: string | number;
      actualRatio1: string | number;
      trueRatio1: string | number;
    }>).map(row => ({
      machineName: row.machineName,
      groupName: row.groupName,
      weeklyTarget: Number(row.weeklyTarget) || 0,
      monthlyTarget: Number(row.monthlyTarget) || 0,
      runHour: Number(row.runHour) || 0,
      stopHour: Number(row.stopHour) || 0,
      warningHour: Number(row.warningHour) || 0,
      actualRatio1: Number(row.actualRatio1) || 0,
      trueRatio1: Number(row.trueRatio1) || 0
    }));

    return res.status(200).json({
      data,
      count: data.length
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
