import type { VercelRequest, VercelResponse } from '@vercel/node';
import mysql from 'mysql2/promise';

interface MachineSettingsRow {
  id: number;
  machine_name: string;
  group_name: string;
  weekly_target: number;
  monthly_target: number;
  created_at: Date;
  updated_at: Date;
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
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  let connection;
  try {
    connection = await getConnection();

    switch (req.method) {
      case 'GET':
        return await getMachineSettings(req, res, connection);
      case 'POST':
        return await createMachineSetting(req, res, connection);
      case 'PUT':
        return await updateMachineSetting(req, res, connection);
      case 'DELETE':
        return await deleteMachineSetting(req, res, connection);
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

async function getMachineSettings(req: VercelRequest, res: VercelResponse, connection: mysql.Connection) {
  const { group } = req.query;

  let sql = 'SELECT * FROM machine_settings WHERE 1=1';
  const params: string[] = [];

  if (group && group !== 'All') {
    sql += ' AND group_name = ?';
    params.push(String(group));
  }

  sql += ' ORDER BY group_name, machine_name';

  const [rows] = await connection.execute(sql, params);

  // Convert DECIMAL fields to numbers
  const data = (rows as MachineSettingsRow[]).map((row) => ({
    id: row.id,
    machineName: row.machine_name,
    groupName: row.group_name,
    weeklyTarget: Number(row.weekly_target) || 0,
    monthlyTarget: Number(row.monthly_target) || 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }));

  return res.status(200).json({ data, count: data.length });
}

async function createMachineSetting(req: VercelRequest, res: VercelResponse, connection: mysql.Connection) {
  const { machineName, groupName, weeklyTarget = 50, monthlyTarget = 50 } = req.body;

  if (!machineName || !groupName) {
    return res.status(400).json({ error: 'machineName and groupName are required' });
  }

  const sql = `
    INSERT INTO machine_settings (machine_name, group_name, weekly_target, monthly_target)
    VALUES (?, ?, ?, ?)
  `;

  const [result] = await connection.execute(sql, [
    machineName,
    groupName,
    Number(weeklyTarget),
    Number(monthlyTarget)
  ]);

  return res.status(201).json({
    message: 'Created',
    data: {
      id: (result as { insertId: number }).insertId,
      machineName,
      groupName,
      weeklyTarget,
      monthlyTarget
    }
  });
}

async function updateMachineSetting(req: VercelRequest, res: VercelResponse, connection: mysql.Connection) {
  const { id } = req.query;
  const { machineName, groupName, weeklyTarget, monthlyTarget } = req.body;

  if (!id) {
    return res.status(400).json({ error: 'id is required' });
  }

  const updates: string[] = [];
  const params: (string | number)[] = [];

  if (machineName !== undefined) {
    updates.push('machine_name = ?');
    params.push(machineName);
  }
  if (groupName !== undefined) {
    updates.push('group_name = ?');
    params.push(groupName);
  }
  if (weeklyTarget !== undefined) {
    updates.push('weekly_target = ?');
    params.push(Number(weeklyTarget));
  }
  if (monthlyTarget !== undefined) {
    updates.push('monthly_target = ?');
    params.push(Number(monthlyTarget));
  }

  if (updates.length === 0) {
    return res.status(400).json({ error: 'No fields to update' });
  }

  params.push(Number(id));
  const sql = `UPDATE machine_settings SET ${updates.join(', ')} WHERE id = ?`;

  await connection.execute(sql, params);

  return res.status(200).json({ message: 'Updated', id: Number(id) });
}

async function deleteMachineSetting(req: VercelRequest, res: VercelResponse, connection: mysql.Connection) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'id is required' });
  }

  await connection.execute('DELETE FROM machine_settings WHERE id = ?', [Number(id)]);

  return res.status(200).json({ message: 'Deleted', id: Number(id) });
}
