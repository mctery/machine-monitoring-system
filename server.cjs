/**
 * Production Server for Machine Monitoring System
 * Serves both static frontend and API routes
 */

const express = require('express');
const path = require('path');
const fs = require('fs');
const mysql = require('mysql2/promise');

// Issue 2: Fallback from .env.local to .env
const envPath = fs.existsSync('.env.local') ? '.env.local' : '.env';
require('dotenv').config({ path: envPath });

const app = express();
const PORT = process.env.PORT || 3000;

// Constants
const DEFAULT_WEEKLY_TARGET = 80;
const DEFAULT_MONTHLY_TARGET = 80;
const DEFAULT_QUERY_LIMIT = 100;
const MAX_QUERY_LIMIT = 1000;

// Middleware
app.use(express.json());

// CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// Issue 5: Database connection pool (created once at startup)
function createDbPool() {
  const required = ['DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
  const missing = required.filter(key => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  return mysql.createPool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
  });
}

const pool = createDbPool();

// ============= API Routes =============

// Health check
app.get('/api/health', async (req, res) => {
  try {
    await pool.execute('SELECT 1');
    res.json({
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      database: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Machine Status
app.get('/api/machine-status', async (req, res) => {
  try {
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
        SELECT machine_name, SUM(run_hour) as weekly_run, SUM(stop_hour) as weekly_stop
        FROM machine_hours WHERE log_time >= ?
        GROUP BY machine_name
      ),
      monthly_stats AS (
        SELECT machine_name, SUM(run_hour) as monthly_run, SUM(stop_hour) as monthly_stop
        FROM machine_hours WHERE log_time >= ?
        GROUP BY machine_name
      )
      SELECT
        ms.id, ms.machine_name as machineName, ms.group_name as groupName,
        ms.weekly_target as weeklyTarget, ms.monthly_target as monthlyTarget,
        lh.run_hour as runHour, lh.stop_hour as stopHour,
        lh.run_status as runStatus, lh.stop_status as stopStatus, lh.rework_status as reworkStatus,
        lh.log_time as logTime,
        ROUND(CASE WHEN (COALESCE(ws.weekly_run, 0) + COALESCE(ws.weekly_stop, 0)) > 0
          THEN (COALESCE(ws.weekly_run, 0) / (COALESCE(ws.weekly_run, 0) + COALESCE(ws.weekly_stop, 0))) * 100
          ELSE 0 END, 2) as weeklyActualRatio,
        ROUND(CASE WHEN (COALESCE(ms2.monthly_run, 0) + COALESCE(ms2.monthly_stop, 0)) > 0
          THEN (COALESCE(ms2.monthly_run, 0) / (COALESCE(ms2.monthly_run, 0) + COALESCE(ms2.monthly_stop, 0))) * 100
          ELSE 0 END, 2) as monthlyActualRatio
      FROM machine_settings ms
      LEFT JOIN latest_hours lh ON ms.machine_name = lh.machine_name
      LEFT JOIN weekly_stats ws ON ms.machine_name = ws.machine_name
      LEFT JOIN monthly_stats ms2 ON ms.machine_name = ms2.machine_name
      ORDER BY ms.group_name, ms.machine_name
    `;

    const [rows] = await pool.execute(sql, [weekStartStr, monthStartStr]);
    const data = rows.map(row => ({
      ...row,
      weeklyTarget: Number(row.weeklyTarget) || 0,
      monthlyTarget: Number(row.monthlyTarget) || 0,
      runHour: row.runHour !== null ? Number(row.runHour) : null,
      stopHour: row.stopHour !== null ? Number(row.stopHour) : null,
      weeklyActualRatio: Number(row.weeklyActualRatio) || 0,
      monthlyActualRatio: Number(row.monthlyActualRatio) || 0
    }));

    const [groupRows] = await pool.execute(`SELECT DISTINCT group_name as groupName FROM machine_settings ORDER BY group_name`);
    const groups = groupRows.map(r => r.groupName);

    res.json({ data, groups, count: data.length });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Machine Settings - GET
app.get('/api/machine-settings', async (req, res) => {
  try {
    const { group } = req.query;
    let sql = `SELECT id, machine_name as machineName, group_name as groupName,
             weekly_target as weeklyTarget, monthly_target as monthlyTarget
      FROM machine_settings WHERE 1=1`;
    const params = [];
    if (group && group !== 'All') {
      sql += ' AND group_name = ?';
      params.push(String(group));
    }
    sql += ' ORDER BY group_name, machine_name';
    const [rows] = await pool.execute(sql, params);
    const data = rows.map(row => ({
      ...row,
      weeklyTarget: Number(row.weeklyTarget) || 0,
      monthlyTarget: Number(row.monthlyTarget) || 0
    }));
    res.json({ data, count: data.length });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Issue 3b: Machine Settings - POST (Create) — match Vercel response format
app.post('/api/machine-settings', async (req, res) => {
  try {
    const { machineName, groupName, weeklyTarget, monthlyTarget } = req.body;
    if (!machineName || !groupName) {
      return res.status(400).json({ error: 'machineName and groupName are required' });
    }
    const wt = weeklyTarget || DEFAULT_WEEKLY_TARGET;
    const mt = monthlyTarget || DEFAULT_MONTHLY_TARGET;
    const [result] = await pool.execute(
      `INSERT INTO machine_settings (machine_name, group_name, weekly_target, monthly_target) VALUES (?, ?, ?, ?)`,
      [machineName, groupName, wt, mt]
    );
    res.status(201).json({
      message: 'Created',
      data: { id: result.insertId, machineName, groupName, weeklyTarget: wt, monthlyTarget: mt }
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Machine name already exists' });
    }
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Issue 3c: Machine Settings - PUT (Update) — support id from query or body
app.put('/api/machine-settings', async (req, res) => {
  try {
    const id = req.query.id || req.body.id;
    const { machineName, groupName, weeklyTarget, monthlyTarget } = req.body;
    if (!id) {
      return res.status(400).json({ error: 'id is required' });
    }
    await pool.execute(
      `UPDATE machine_settings SET machine_name = ?, group_name = ?, weekly_target = ?, monthly_target = ? WHERE id = ?`,
      [machineName, groupName, weeklyTarget, monthlyTarget, id]
    );
    res.json({ message: 'Updated', id: Number(id) });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Issue 3c: Machine Settings - DELETE — support id from query or body
app.delete('/api/machine-settings', async (req, res) => {
  try {
    const id = req.query.id || req.body.id;
    if (!id) {
      return res.status(400).json({ error: 'id is required' });
    }
    await pool.execute(`DELETE FROM machine_settings WHERE id = ?`, [id]);
    res.json({ message: 'Deleted', id: Number(id) });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Helper: parse date param - use directly if already in "YYYY-MM-DD HH:mm:ss" format
function parseDateParam(raw) {
  const str = raw.trim();
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(str)) {
    return str;
  }
  const d = new Date(str);
  if (isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 19).replace('T', ' ');
}

// Timeline Data
app.get('/api/timeline-data', async (req, res) => {
  try {
    const { from, to } = req.query;
    if (!from || !to) {
      return res.status(400).json({ error: 'from and to query parameters are required' });
    }

    const fromDate = parseDateParam(from);
    const toDate = parseDateParam(to);
    if (!fromDate || !toDate) {
      return res.status(400).json({ error: 'Invalid date format' });
    }

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

    const [rows] = await pool.execute(sql, [fromDate, toDate]);
    const data = rows.map(row => ({
      machineName: row.machineName,
      groupName: row.groupName,
      weeklyTarget: Number(row.weeklyTarget) || 0,
      monthlyTarget: Number(row.monthlyTarget) || 0,
      runHour: Number(row.runHour) || 0,
      stopHour: Number(row.stopHour) || 0,
      actualRatio1: Number(row.ratio) || 0,
      trueRatio1: Number(row.ratio) || 0
    }));

    res.json({ data, count: data.length });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Issue 3a: Timeline Segments — match Vercel API (LEFT JOIN machine_settings for groupName)
app.get('/api/timeline-segments', async (req, res) => {
  try {
    const { from, to } = req.query;
    if (!from || !to) {
      return res.status(400).json({ error: 'from and to query parameters are required' });
    }

    const fromDate = parseDateParam(from);
    const toDate = parseDateParam(to);
    if (!fromDate || !toDate) {
      return res.status(400).json({ error: 'Invalid date format' });
    }

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

    const [rows] = await pool.execute(sql, [fromDate, toDate]);
    const data = rows.map(row => ({
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

    res.json({ data, count: data.length });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Machine Hours - GET & POST
app.get('/api/machine-hours', async (req, res) => {
  try {
    const { machine, from, to, limit = String(DEFAULT_QUERY_LIMIT) } = req.query;

    let sql = 'SELECT * FROM machine_hours WHERE 1=1';
    const params = [];

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

    const limitNum = Math.min(Number(limit), MAX_QUERY_LIMIT);
    sql += ` ORDER BY log_time DESC LIMIT ${limitNum}`;

    const [rows] = await pool.execute(sql, params);
    const data = rows.map(row => ({
      id: row.id,
      logTime: row.log_time,
      machineName: row.machine_name,
      runHour: Number(row.run_hour),
      stopHour: Number(row.stop_hour),
      runStatus: row.run_status,
      stopStatus: row.stop_status,
      reworkStatus: row.rework_status
    }));

    res.json({ data, count: data.length });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

app.post('/api/machine-hours', async (req, res) => {
  try {
    const { logTime, machineName, runHour, stopHour, runStatus, stopStatus, reworkStatus } = req.body;

    if (!logTime || !machineName || runHour === undefined || stopHour === undefined) {
      return res.status(400).json({ error: 'logTime, machineName, runHour, stopHour are required' });
    }

    const [result] = await pool.execute(
      `INSERT INTO machine_hours (log_time, machine_name, run_hour, stop_hour, run_status, stop_status, rework_status) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [logTime, machineName, Number(runHour), Number(stopHour), Number(runStatus) || 0, Number(stopStatus) || 0, reworkStatus !== undefined ? Number(reworkStatus) : null]
    );

    res.status(201).json({
      message: 'Created',
      data: { id: result.insertId, logTime, machineName, runHour, stopHour, runStatus, stopStatus, reworkStatus }
    });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Machine Hours - DELETE (single by id or all)
app.delete('/api/machine-hours', async (req, res) => {
  try {
    const { id, all } = req.query;

    if (all === 'true') {
      const [result] = await pool.execute('DELETE FROM machine_hours');
      return res.json({ message: `Deleted ${result.affectedRows} entries`, count: result.affectedRows });
    }

    if (!id) {
      return res.status(400).json({ error: 'id or all=true is required' });
    }

    const [result] = await pool.execute('DELETE FROM machine_hours WHERE id = ?', [Number(id)]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Entry not found' });
    }

    res.json({ message: 'Deleted' });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Init Settings - POST (initialize machine_settings table with default data)
app.post('/api/init-settings', async (req, res) => {
  try {
    // Create table if not exists
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS machine_settings (
        id INT PRIMARY KEY AUTO_INCREMENT,
        machine_name VARCHAR(50) NOT NULL UNIQUE,
        group_name VARCHAR(50) NOT NULL,
        weekly_target FLOAT NOT NULL DEFAULT 80,
        monthly_target FLOAT NOT NULL DEFAULT 80,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_machine_name (machine_name),
        INDEX idx_group_name (group_name)
      )
    `);

    // Check if data already exists
    const [existingRows] = await pool.execute('SELECT COUNT(*) as count FROM machine_settings');
    const count = existingRows[0].count;

    if (count > 0) {
      return res.status(200).json({ message: 'Table already has data', existingCount: count });
    }

    // Mock machines data
    const mockMachines = [
      { group: 'PIS', machineName: 'Model 1' }, { group: 'PIS', machineName: 'Model 2' },
      { group: 'PIS', machineName: 'Model 3' }, { group: 'PIS', machineName: 'Model 4' },
      { group: 'PIS', machineName: 'Model 5' }, { group: 'PIS', machineName: 'Model 6' },
      { group: 'PIS', machineName: 'PIS Casting' },
      { group: 'PIS', machineName: 'Side piece 1' }, { group: 'PIS', machineName: 'Side piece 2' },
      { group: 'PIS', machineName: 'Side piece 3' }, { group: 'PIS', machineName: 'Side piece 4' },
      { group: 'PIS', machineName: 'Side piece 5' }, { group: 'PIS', machineName: 'Side piece 6' },
      { group: 'PIS', machineName: 'Side piece 7' }, { group: 'PIS', machineName: 'Side piece 8' },
      { group: 'PIS', machineName: 'Side piece 9' }, { group: 'PIS', machineName: 'Side piece 10' },
      { group: 'PIS', machineName: 'Side piece 11' }, { group: 'PIS', machineName: 'Side piece 12' },
      { group: 'PIS', machineName: 'Side piece 13' }, { group: 'PIS', machineName: 'Side piece 14' },
      { group: 'PIS', machineName: 'NC Lathe 1' }, { group: 'PIS', machineName: 'NC Lathe 2' },
      { group: 'PIS', machineName: 'NC Lathe 3' }, { group: 'PIS', machineName: 'NC Lathe 4' },
      { group: 'PIS', machineName: 'NC Lathe 5' },
      { group: '3G', machineName: '3G Laser 1' }, { group: '3G', machineName: '3G Laser 2' },
      { group: '3G', machineName: '3G Laser 3' },
      { group: 'SECTOR', machineName: 'Turning 1' }, { group: 'SECTOR', machineName: 'Turning 2' },
      { group: 'SECTOR', machineName: 'Turning 3' }, { group: 'SECTOR', machineName: 'Turning 8' },
      { group: 'SECTOR', machineName: 'Machining 3' }, { group: 'SECTOR', machineName: 'Machining 4' },
      { group: 'SECTOR', machineName: 'Machining 9' }, { group: 'SECTOR', machineName: 'Machining 10' },
      { group: 'SECTOR (TR)', machineName: 'Machining 1' }, { group: 'SECTOR (TR)', machineName: 'Machining 7' },
      { group: 'SECTOR (TR)', machineName: 'Machining 8' }, { group: 'SECTOR (TR)', machineName: 'Turning 4' },
      { group: 'SECTOR (TR)', machineName: 'Turning 9' },
      { group: 'SIDE MOLD', machineName: 'Machining 2' }, { group: 'SIDE MOLD', machineName: 'Machining 5' },
      { group: 'SIDE MOLD', machineName: 'Machining 6' }, { group: 'SIDE MOLD', machineName: 'Turning 5' },
      { group: 'SIDE MOLD', machineName: 'Turning 7' },
      { group: 'SIDE MOLD', machineName: 'Letter 1' }, { group: 'SIDE MOLD', machineName: 'Letter 2' },
      { group: 'SIDE MOLD', machineName: 'Letter 3' }, { group: 'SIDE MOLD', machineName: 'Letter 4' },
      { group: 'SIDE MOLD', machineName: 'Letter 5' }, { group: 'SIDE MOLD', machineName: 'Letter 6' },
      { group: 'SIDE MOLD', machineName: 'Letter 7' }, { group: 'SIDE MOLD', machineName: 'Letter 8' },
      { group: 'SIDE MOLD', machineName: 'Letter 9' }, { group: 'SIDE MOLD', machineName: 'Letter 10' },
      { group: 'SIDE MOLD', machineName: 'Letter 11' },
      { group: 'BLADE', machineName: 'Laser 1' }, { group: 'BLADE', machineName: 'Laser 2' },
    ];

    let insertedCount = 0;
    for (const machine of mockMachines) {
      try {
        await pool.execute(
          `INSERT INTO machine_settings (machine_name, group_name, weekly_target, monthly_target) VALUES (?, ?, ?, ?)`,
          [machine.machineName, machine.group, DEFAULT_WEEKLY_TARGET, DEFAULT_MONTHLY_TARGET]
        );
        insertedCount++;
      } catch (err) {
        // Skip duplicates
      }
    }

    res.status(201).json({ message: 'Initialized successfully', insertedCount, totalMachines: mockMachines.length });
  } catch (error) {
    console.error('Init Error:', error);
    res.status(500).json({ error: 'Initialization failed', message: error.message });
  }
});

// Seed Hours - POST (generate random machine_hours data for testing)
app.post('/api/seed-hours', async (req, res) => {
  try {
    const [machines] = await pool.execute('SELECT machine_name FROM machine_settings');
    const machineNames = machines.map(m => m.machine_name);

    if (machineNames.length === 0) {
      return res.status(400).json({ error: 'No machines found in machine_settings. Please add machines first.' });
    }

    const now = new Date();
    const records = [];

    for (const machineName of machineNames) {
      for (let daysAgo = 0; daysAgo < 30; daysAgo++) {
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

    await pool.execute('DELETE FROM machine_hours');

    const batchSize = 1000;
    let insertedCount = 0;
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      const placeholders = batch.map(() => '(?, ?, ?, ?, ?, ?, ?)').join(', ');
      const values = batch.flat();
      await pool.execute(
        `INSERT INTO machine_hours (log_time, machine_name, run_hour, stop_hour, run_status, stop_status, rework_status) VALUES ${placeholders}`,
        values
      );
      insertedCount += batch.length;
    }

    res.json({ message: 'Random data generated successfully', insertedCount, machineCount: machineNames.length, daysOfData: 30 });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Machine Hours Times - GET (lightweight timestamps for gap detection)
app.get('/api/machine-hours-times', async (req, res) => {
  try {
    const { from, to } = req.query;
    if (!from || !to) {
      return res.status(400).json({ error: 'from and to query parameters are required' });
    }

    const [rows] = await pool.execute(
      `SELECT machine_name, log_time FROM machine_hours WHERE log_time >= ? AND log_time <= ? ORDER BY machine_name, log_time`,
      [String(from), String(to)]
    );

    const data = rows.map(row => ({
      machineName: row.machine_name,
      logTime: row.log_time,
    }));

    res.json({ data, count: data.length });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// ============= Static Files =============

// Serve static files from dist folder
app.use(express.static(path.join(__dirname, 'dist')));

// SPA fallback - serve index.html for all non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// ============= Start Server =============

app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log('  Machine Monitoring System - Production Server');
  console.log('='.repeat(50));
  console.log(`  Status:    Running`);
  console.log(`  URL:       http://localhost:${PORT}`);
  console.log(`  Database:  ${process.env.DB_HOST}:${process.env.DB_PORT}`);
  console.log(`  Env:       ${envPath}`);
  console.log(`  Started:   ${new Date().toLocaleString()}`);
  console.log('='.repeat(50));

  // Signal PM2 that the server is ready
  if (process.send) {
    process.send('ready');
  }
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down...');
  await pool.end();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down...');
  await pool.end();
  process.exit(0);
});
