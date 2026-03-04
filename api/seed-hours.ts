import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getConnection, setCORS, errorMessage } from './_db';

const SEED_DAYS = 30;
const SEED_BATCH_SIZE = 1000;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCORS(res, 'POST, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed. Use POST to seed data.' });

  let connection;
  try {
    connection = await getConnection();

    const [machines] = await connection.execute('SELECT machine_name FROM machine_settings');
    const machineNames = (machines as { machine_name: string }[]).map(m => m.machine_name);

    if (machineNames.length === 0) {
      return res.status(400).json({ error: 'No machines found in machine_settings. Please add machines first.' });
    }

    const now = new Date();
    const records: Array<[string, string, number, number, number, number, number | null]> = [];

    for (const machineName of machineNames) {
      for (let daysAgo = 0; daysAgo < SEED_DAYS; daysAgo++) {
        const recordsPerDay = Math.floor(Math.random() * 3) + 1;

        for (let r = 0; r < recordsPerDay; r++) {
          const logTime = new Date(now);
          logTime.setDate(now.getDate() - daysAgo);
          logTime.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60), 0, 0);

          const runHour = Math.random() * 0.8 + 0.1;
          const stopHour = Math.random() * 0.3 + 0.05;
          const runStatus = Math.random() > 0.3 ? 1 : 0;
          const stopStatus = runStatus === 0 ? 1 : 0;
          const reworkStatus = Math.random() > 0.9 ? 1 : null;

          const logTimeStr = logTime.toISOString().slice(0, 19).replace('T', ' ');
          records.push([logTimeStr, machineName, runHour, stopHour, runStatus, stopStatus, reworkStatus]);
        }
      }
    }

    await connection.execute('DELETE FROM machine_hours');

    let insertedCount = 0;
    for (let i = 0; i < records.length; i += SEED_BATCH_SIZE) {
      const batch = records.slice(i, i + SEED_BATCH_SIZE);
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
      daysOfData: SEED_DAYS
    });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error', message: errorMessage(error) });
  } finally {
    if (connection) await connection.end();
  }
}
