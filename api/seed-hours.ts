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

    // Get all machine names from machine_settings
    const [machines] = await connection.execute(
      'SELECT machine_name FROM machine_settings'
    );
    const machineNames = (machines as { machine_name: string }[]).map(m => m.machine_name);

    if (machineNames.length === 0) {
      return res.status(400).json({ error: 'No machines found in machine_settings. Please add machines first.' });
    }

    // Generate random data for the past 30 days
    const now = new Date();
    const records: Array<[string, string, number, number, number, number, number | null]> = [];

    for (const machineName of machineNames) {
      // Generate 1-3 records per day for the past 30 days
      for (let daysAgo = 0; daysAgo < 30; daysAgo++) {
        const recordsPerDay = Math.floor(Math.random() * 3) + 1; // 1-3 records per day

        for (let r = 0; r < recordsPerDay; r++) {
          const logTime = new Date(now);
          logTime.setDate(now.getDate() - daysAgo);
          logTime.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60), 0, 0);

          // Random run/stop hours (typically run_hour is higher)
          const runHour = Math.random() * 0.8 + 0.1; // 0.1 - 0.9
          const stopHour = Math.random() * 0.3 + 0.05; // 0.05 - 0.35

          // Status: 1 = active, 0 = inactive
          const runStatus = Math.random() > 0.3 ? 1 : 0; // 70% chance of running
          const stopStatus = runStatus === 0 ? 1 : 0;

          // Rework status: null or 1 (10% chance of rework)
          const reworkStatus = Math.random() > 0.9 ? 1 : null;

          const logTimeStr = logTime.toISOString().slice(0, 19).replace('T', ' ');
          records.push([logTimeStr, machineName, runHour, stopHour, runStatus, stopStatus, reworkStatus]);
        }
      }
    }

    // Clear existing data first (optional - comment out if you want to append)
    await connection.execute('DELETE FROM machine_hours');

    // Insert in batches of 100
    const batchSize = 1000;
    let insertedCount = 0;

    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      const placeholders = batch.map(() => '(?, ?, ?, ?, ?, ?, ?)').join(', ');
      const values = batch.flat();

      await connection.execute(
        `INSERT INTO machine_hours (log_time, machine_name, run_hour, stop_hour, run_status, stop_status, rework_status) VALUES ${placeholders}`,
        values
      );
      insertedCount += batch.length;
    }

    return res.status(200).json({
      message: 'Random data generated successfully',
      insertedCount,
      machineCount: machineNames.length,
      daysOfData: 30
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
