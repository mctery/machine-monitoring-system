import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getConnection, setCORS, errorMessage, DEFAULT_WEEKLY_TARGET, DEFAULT_MONTHLY_TARGET } from './_db';

// Mock data from the application
const mockMachines = [
  { group: 'PIS', machineName: 'Model 1', weeklyTarget: DEFAULT_WEEKLY_TARGET, monthlyTarget: DEFAULT_MONTHLY_TARGET },
  { group: 'PIS', machineName: 'Model 2', weeklyTarget: DEFAULT_WEEKLY_TARGET, monthlyTarget: DEFAULT_MONTHLY_TARGET },
  { group: 'PIS', machineName: 'Model 3', weeklyTarget: DEFAULT_WEEKLY_TARGET, monthlyTarget: DEFAULT_MONTHLY_TARGET },
  { group: 'PIS', machineName: 'Model 4', weeklyTarget: DEFAULT_WEEKLY_TARGET, monthlyTarget: DEFAULT_MONTHLY_TARGET },
  { group: 'PIS', machineName: 'Model 5', weeklyTarget: DEFAULT_WEEKLY_TARGET, monthlyTarget: DEFAULT_MONTHLY_TARGET },
  { group: 'PIS', machineName: 'Model 6', weeklyTarget: DEFAULT_WEEKLY_TARGET, monthlyTarget: DEFAULT_MONTHLY_TARGET },
  { group: 'PIS', machineName: 'PIS Casting', weeklyTarget: DEFAULT_WEEKLY_TARGET, monthlyTarget: DEFAULT_MONTHLY_TARGET },
  { group: 'PIS', machineName: 'Side piece 1', weeklyTarget: DEFAULT_WEEKLY_TARGET, monthlyTarget: DEFAULT_MONTHLY_TARGET },
  { group: 'PIS', machineName: 'Side piece 2', weeklyTarget: DEFAULT_WEEKLY_TARGET, monthlyTarget: DEFAULT_MONTHLY_TARGET },
  { group: 'PIS', machineName: 'Side piece 3', weeklyTarget: DEFAULT_WEEKLY_TARGET, monthlyTarget: DEFAULT_MONTHLY_TARGET },
  { group: 'PIS', machineName: 'Side piece 4', weeklyTarget: DEFAULT_WEEKLY_TARGET, monthlyTarget: DEFAULT_MONTHLY_TARGET },
  { group: 'PIS', machineName: 'Side piece 5', weeklyTarget: DEFAULT_WEEKLY_TARGET, monthlyTarget: DEFAULT_MONTHLY_TARGET },
  { group: 'PIS', machineName: 'Side piece 6', weeklyTarget: DEFAULT_WEEKLY_TARGET, monthlyTarget: DEFAULT_MONTHLY_TARGET },
  { group: 'PIS', machineName: 'Side piece 7', weeklyTarget: DEFAULT_WEEKLY_TARGET, monthlyTarget: DEFAULT_MONTHLY_TARGET },
  { group: 'PIS', machineName: 'Side piece 8', weeklyTarget: DEFAULT_WEEKLY_TARGET, monthlyTarget: DEFAULT_MONTHLY_TARGET },
  { group: 'PIS', machineName: 'Side piece 9', weeklyTarget: DEFAULT_WEEKLY_TARGET, monthlyTarget: DEFAULT_MONTHLY_TARGET },
  { group: 'PIS', machineName: 'Side piece 10', weeklyTarget: DEFAULT_WEEKLY_TARGET, monthlyTarget: DEFAULT_MONTHLY_TARGET },
  { group: 'PIS', machineName: 'Side piece 11', weeklyTarget: DEFAULT_WEEKLY_TARGET, monthlyTarget: DEFAULT_MONTHLY_TARGET },
  { group: 'PIS', machineName: 'Side piece 12', weeklyTarget: DEFAULT_WEEKLY_TARGET, monthlyTarget: DEFAULT_MONTHLY_TARGET },
  { group: 'PIS', machineName: 'Side piece 13', weeklyTarget: DEFAULT_WEEKLY_TARGET, monthlyTarget: DEFAULT_MONTHLY_TARGET },
  { group: 'PIS', machineName: 'Side piece 14', weeklyTarget: DEFAULT_WEEKLY_TARGET, monthlyTarget: DEFAULT_MONTHLY_TARGET },
  { group: 'PIS', machineName: 'NC Lathe 1', weeklyTarget: DEFAULT_WEEKLY_TARGET, monthlyTarget: DEFAULT_MONTHLY_TARGET },
  { group: 'PIS', machineName: 'NC Lathe 2', weeklyTarget: DEFAULT_WEEKLY_TARGET, monthlyTarget: DEFAULT_MONTHLY_TARGET },
  { group: 'PIS', machineName: 'NC Lathe 3', weeklyTarget: DEFAULT_WEEKLY_TARGET, monthlyTarget: DEFAULT_MONTHLY_TARGET },
  { group: 'PIS', machineName: 'NC Lathe 4', weeklyTarget: DEFAULT_WEEKLY_TARGET, monthlyTarget: DEFAULT_MONTHLY_TARGET },
  { group: 'PIS', machineName: 'NC Lathe 5', weeklyTarget: DEFAULT_WEEKLY_TARGET, monthlyTarget: DEFAULT_MONTHLY_TARGET },
  { group: '3G', machineName: '3G Laser 1', weeklyTarget: DEFAULT_WEEKLY_TARGET, monthlyTarget: DEFAULT_MONTHLY_TARGET },
  { group: '3G', machineName: '3G Laser 2', weeklyTarget: DEFAULT_WEEKLY_TARGET, monthlyTarget: DEFAULT_MONTHLY_TARGET },
  { group: '3G', machineName: '3G Laser 3', weeklyTarget: DEFAULT_WEEKLY_TARGET, monthlyTarget: DEFAULT_MONTHLY_TARGET },
  { group: 'SECTOR', machineName: 'Turning 1', weeklyTarget: DEFAULT_WEEKLY_TARGET, monthlyTarget: DEFAULT_MONTHLY_TARGET },
  { group: 'SECTOR', machineName: 'Turning 2', weeklyTarget: DEFAULT_WEEKLY_TARGET, monthlyTarget: DEFAULT_MONTHLY_TARGET },
  { group: 'SECTOR', machineName: 'Turning 3', weeklyTarget: DEFAULT_WEEKLY_TARGET, monthlyTarget: DEFAULT_MONTHLY_TARGET },
  { group: 'SECTOR', machineName: 'Turning 8', weeklyTarget: DEFAULT_WEEKLY_TARGET, monthlyTarget: DEFAULT_MONTHLY_TARGET },
  { group: 'SECTOR', machineName: 'Machining 3', weeklyTarget: DEFAULT_WEEKLY_TARGET, monthlyTarget: DEFAULT_MONTHLY_TARGET },
  { group: 'SECTOR', machineName: 'Machining 4', weeklyTarget: DEFAULT_WEEKLY_TARGET, monthlyTarget: DEFAULT_MONTHLY_TARGET },
  { group: 'SECTOR', machineName: 'Machining 9', weeklyTarget: DEFAULT_WEEKLY_TARGET, monthlyTarget: DEFAULT_MONTHLY_TARGET },
  { group: 'SECTOR', machineName: 'Machining 10', weeklyTarget: DEFAULT_WEEKLY_TARGET, monthlyTarget: DEFAULT_MONTHLY_TARGET },
  { group: 'SECTOR (TR)', machineName: 'Machining 1', weeklyTarget: DEFAULT_WEEKLY_TARGET, monthlyTarget: DEFAULT_MONTHLY_TARGET },
  { group: 'SECTOR (TR)', machineName: 'Machining 7', weeklyTarget: DEFAULT_WEEKLY_TARGET, monthlyTarget: DEFAULT_MONTHLY_TARGET },
  { group: 'SECTOR (TR)', machineName: 'Machining 8', weeklyTarget: DEFAULT_WEEKLY_TARGET, monthlyTarget: DEFAULT_MONTHLY_TARGET },
  { group: 'SECTOR (TR)', machineName: 'Turning 4', weeklyTarget: DEFAULT_WEEKLY_TARGET, monthlyTarget: DEFAULT_MONTHLY_TARGET },
  { group: 'SECTOR (TR)', machineName: 'Turning 9', weeklyTarget: DEFAULT_WEEKLY_TARGET, monthlyTarget: DEFAULT_MONTHLY_TARGET },
  { group: 'SIDE MOLD', machineName: 'Machining 2', weeklyTarget: DEFAULT_WEEKLY_TARGET, monthlyTarget: DEFAULT_MONTHLY_TARGET },
  { group: 'SIDE MOLD', machineName: 'Machining 5', weeklyTarget: DEFAULT_WEEKLY_TARGET, monthlyTarget: DEFAULT_MONTHLY_TARGET },
  { group: 'SIDE MOLD', machineName: 'Machining 6', weeklyTarget: DEFAULT_WEEKLY_TARGET, monthlyTarget: DEFAULT_MONTHLY_TARGET },
  { group: 'SIDE MOLD', machineName: 'Turning 5', weeklyTarget: DEFAULT_WEEKLY_TARGET, monthlyTarget: DEFAULT_MONTHLY_TARGET },
  { group: 'SIDE MOLD', machineName: 'Turning 7', weeklyTarget: DEFAULT_WEEKLY_TARGET, monthlyTarget: DEFAULT_MONTHLY_TARGET },
  { group: 'SIDE MOLD', machineName: 'Letter 1', weeklyTarget: DEFAULT_WEEKLY_TARGET, monthlyTarget: DEFAULT_MONTHLY_TARGET },
  { group: 'SIDE MOLD', machineName: 'Letter 2', weeklyTarget: DEFAULT_WEEKLY_TARGET, monthlyTarget: DEFAULT_MONTHLY_TARGET },
  { group: 'SIDE MOLD', machineName: 'Letter 3', weeklyTarget: DEFAULT_WEEKLY_TARGET, monthlyTarget: DEFAULT_MONTHLY_TARGET },
  { group: 'SIDE MOLD', machineName: 'Letter 4', weeklyTarget: DEFAULT_WEEKLY_TARGET, monthlyTarget: DEFAULT_MONTHLY_TARGET },
  { group: 'SIDE MOLD', machineName: 'Letter 5', weeklyTarget: DEFAULT_WEEKLY_TARGET, monthlyTarget: DEFAULT_MONTHLY_TARGET },
  { group: 'SIDE MOLD', machineName: 'Letter 6', weeklyTarget: DEFAULT_WEEKLY_TARGET, monthlyTarget: DEFAULT_MONTHLY_TARGET },
  { group: 'SIDE MOLD', machineName: 'Letter 7', weeklyTarget: DEFAULT_WEEKLY_TARGET, monthlyTarget: DEFAULT_MONTHLY_TARGET },
  { group: 'SIDE MOLD', machineName: 'Letter 8', weeklyTarget: DEFAULT_WEEKLY_TARGET, monthlyTarget: DEFAULT_MONTHLY_TARGET },
  { group: 'SIDE MOLD', machineName: 'Letter 9', weeklyTarget: DEFAULT_WEEKLY_TARGET, monthlyTarget: DEFAULT_MONTHLY_TARGET },
  { group: 'SIDE MOLD', machineName: 'Letter 10', weeklyTarget: DEFAULT_WEEKLY_TARGET, monthlyTarget: DEFAULT_MONTHLY_TARGET },
  { group: 'SIDE MOLD', machineName: 'Letter 11', weeklyTarget: DEFAULT_WEEKLY_TARGET, monthlyTarget: DEFAULT_MONTHLY_TARGET },
  { group: 'BLADE', machineName: 'Laser 1', weeklyTarget: DEFAULT_WEEKLY_TARGET, monthlyTarget: DEFAULT_MONTHLY_TARGET },
  { group: 'BLADE', machineName: 'Laser 2', weeklyTarget: DEFAULT_WEEKLY_TARGET, monthlyTarget: DEFAULT_MONTHLY_TARGET },
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCORS(res, 'POST, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed. Use POST to initialize.' });

  let connection;
  try {
    connection = await getConnection();

    // Create table if not exists
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS machine_settings (
        id INT PRIMARY KEY AUTO_INCREMENT,
        machine_name VARCHAR(50) NOT NULL UNIQUE,
        group_name VARCHAR(50) NOT NULL,
        weekly_target DECIMAL(5,2) NOT NULL DEFAULT 80.00,
        monthly_target DECIMAL(5,2) NOT NULL DEFAULT 80.00,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_machine_name (machine_name),
        INDEX idx_group_name (group_name)
      )
    `;

    await connection.execute(createTableSQL);

    // Check if data already exists
    const [existingRows] = await connection.execute('SELECT COUNT(*) as count FROM machine_settings');
    const count = (existingRows as { count: number }[])[0].count;

    if (count > 0) {
      return res.status(200).json({
        message: 'Table already has data',
        existingCount: count
      });
    }

    // Insert mock data
    const insertSQL = `
      INSERT INTO machine_settings (machine_name, group_name, weekly_target, monthly_target)
      VALUES (?, ?, ?, ?)
    `;

    let insertedCount = 0;
    for (const machine of mockMachines) {
      try {
        await connection.execute(insertSQL, [
          machine.machineName,
          machine.group,
          machine.weeklyTarget,
          machine.monthlyTarget
        ]);
        insertedCount++;
      } catch (err) {
        // Skip duplicates
        console.log(`Skipped duplicate: ${machine.machineName}`);
      }
    }

    return res.status(201).json({
      message: 'Initialized successfully',
      insertedCount,
      totalMachines: mockMachines.length
    });

  } catch (error) {
    console.error('Init Error:', error);
    return res.status(500).json({ error: 'Initialization failed', message: errorMessage(error) });
  } finally {
    if (connection) await connection.end();
  }
}
