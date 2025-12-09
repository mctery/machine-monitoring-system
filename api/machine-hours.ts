import type { VercelRequest, VercelResponse } from '@vercel/node';
import pool from './db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

interface MachineHoursRow extends RowDataPacket {
  id: number;
  log_time: Date;
  machine_name: string;
  run_hour: number;
  stop_hour: number;
  run_status: number;
  stop_status: number;
  rework_status: number | null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    switch (req.method) {
      case 'GET':
        return await getMachineHours(req, res);
      case 'POST':
        return await createMachineHours(req, res);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// GET - Fetch machine hours data
async function getMachineHours(req: VercelRequest, res: VercelResponse) {
  const { machine, from, to, limit = '100' } = req.query;

  let sql = 'SELECT * FROM machine_hours WHERE 1=1';
  const params: (string | Date | number)[] = [];

  if (machine) {
    sql += ' AND machine_name = ?';
    params.push(String(machine));
  }

  if (from) {
    sql += ' AND log_time >= ?';
    params.push(new Date(String(from)));
  }

  if (to) {
    sql += ' AND log_time <= ?';
    params.push(new Date(String(to)));
  }

  sql += ' ORDER BY log_time DESC LIMIT ?';
  params.push(Math.min(Number(limit), 1000));

  const [rows] = await pool.execute<MachineHoursRow[]>(sql, params);

  // Map to camelCase for frontend
  const data = rows.map(row => ({
    id: row.id,
    logTime: row.log_time,
    machineName: row.machine_name,
    runHour: row.run_hour,
    stopHour: row.stop_hour,
    runStatus: row.run_status,
    stopStatus: row.stop_status,
    reworkStatus: row.rework_status
  }));

  return res.status(200).json({ data, count: data.length });
}

// POST - Create machine hours entry
async function createMachineHours(req: VercelRequest, res: VercelResponse) {
  const { logTime, machineName, runHour, stopHour, runStatus, stopStatus, reworkStatus } = req.body;

  if (!logTime || !machineName || runHour === undefined || stopHour === undefined) {
    return res.status(400).json({
      error: 'logTime, machineName, runHour, stopHour are required'
    });
  }

  const sql = `
    INSERT INTO machine_hours (log_time, machine_name, run_hour, stop_hour, run_status, stop_status, rework_status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  const [result] = await pool.execute<ResultSetHeader>(sql, [
    new Date(logTime),
    machineName,
    Number(runHour),
    Number(stopHour),
    Number(runStatus) || 0,
    Number(stopStatus) || 0,
    reworkStatus !== undefined ? Number(reworkStatus) : null
  ]);

  return res.status(201).json({
    message: 'Created',
    data: { id: result.insertId, logTime, machineName, runHour, stopHour, runStatus, stopStatus, reworkStatus }
  });
}
