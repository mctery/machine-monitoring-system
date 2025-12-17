import type { VercelRequest, VercelResponse } from '@vercel/node';
import mysql from 'mysql2/promise';

interface MachineHoursRow {
  id: number;
  log_time: Date;
  machine_name: string;
  run_hour: number;
  stop_hour: number;
  warning_hour: number;
  run_status: number;
  stop_status: number;
  rework_status: number | null;
}

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
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  let connection;
  try {
    connection = await getConnection();

    switch (req.method) {
      case 'GET':
        return await getMachineHours(req, res, connection);
      case 'POST':
        return await createMachineHours(req, res, connection);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
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

async function getMachineHours(req: VercelRequest, res: VercelResponse, connection: mysql.Connection) {
  const { machine, from, to, limit = '100' } = req.query;

  let sql = 'SELECT * FROM machine_hours WHERE 1=1';
  const params: (string | number)[] = [];

  if (machine) {
    sql += ' AND machine_name = ?';
    params.push(String(machine));
  }

  if (from) {
    sql += ' AND log_time >= ?';
    params.push(String(from));
  }

  if (to) {
    sql += ' AND log_time <= ?';
    params.push(String(to));
  }

  const limitNum = Math.min(Number(limit), 1000);
  sql += ` ORDER BY log_time DESC LIMIT ${limitNum}`;

  const [rows] = await connection.execute(sql, params);

  const data = (rows as MachineHoursRow[]).map((row) => ({
    id: row.id,
    logTime: row.log_time,
    machineName: row.machine_name,
    runHour: row.run_hour,
    stopHour: row.stop_hour,
    warningHour: row.warning_hour,
    runStatus: row.run_status,
    stopStatus: row.stop_status,
    reworkStatus: row.rework_status
  }));

  return res.status(200).json({ data, count: data.length });
}

async function createMachineHours(req: VercelRequest, res: VercelResponse, connection: mysql.Connection) {
  const { logTime, machineName, runHour, stopHour, warningHour, runStatus, stopStatus, reworkStatus } = req.body;

  if (!logTime || !machineName || runHour === undefined || stopHour === undefined) {
    return res.status(400).json({
      error: 'logTime, machineName, runHour, stopHour are required'
    });
  }

  const sql = `
    INSERT INTO machine_hours (log_time, machine_name, run_hour, stop_hour, warning_hour, run_status, stop_status, rework_status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const [result] = await connection.execute(sql, [
    logTime,
    machineName,
    Number(runHour),
    Number(stopHour),
    Number(warningHour) || 0,
    Number(runStatus) || 0,
    Number(stopStatus) || 0,
    reworkStatus !== undefined ? Number(reworkStatus) : null
  ]);

  return res.status(201).json({
    message: 'Created',
    data: { id: (result as { insertId: number }).insertId, logTime, machineName, runHour, stopHour, warningHour: Number(warningHour) || 0, runStatus, stopStatus, reworkStatus }
  });
}
