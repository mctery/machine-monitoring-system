/**
 * Production Server for Machine Monitoring System
 * Serves both static frontend and API routes
 */

const express = require('express');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

const app = express();
const PORT = process.env.PORT || 3000;

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

// Database connection helper
async function getConnection() {
  const required = ['DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
  const missing = required.filter(key => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  return mysql.createConnection({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined
  });
}

// ============= API Routes =============

// Health check
app.get('/api/health', async (req, res) => {
  let connection;
  try {
    connection = await getConnection();
    await connection.execute('SELECT 1');
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
  } finally {
    if (connection) await connection.end();
  }
});

// Machine Status
app.get('/api/machine-status', async (req, res) => {
  let connection;
  try {
    connection = await getConnection();

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

    const [rows] = await connection.execute(sql, [weekStartStr, monthStartStr]);
    const data = rows.map(row => ({
      ...row,
      weeklyTarget: Number(row.weeklyTarget) || 0,
      monthlyTarget: Number(row.monthlyTarget) || 0,
      runHour: row.runHour !== null ? Number(row.runHour) : null,
      stopHour: row.stopHour !== null ? Number(row.stopHour) : null,
      weeklyActualRatio: Number(row.weeklyActualRatio) || 0,
      monthlyActualRatio: Number(row.monthlyActualRatio) || 0
    }));

    const [groupRows] = await connection.execute(`SELECT DISTINCT group_name as groupName FROM machine_settings ORDER BY group_name`);
    const groups = groupRows.map(r => r.groupName);

    res.json({ data, groups, count: data.length });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  } finally {
    if (connection) await connection.end();
  }
});

// Machine Settings - GET
app.get('/api/machine-settings', async (req, res) => {
  let connection;
  try {
    connection = await getConnection();
    const [rows] = await connection.execute(`
      SELECT id, machine_name as machineName, group_name as groupName,
             weekly_target as weeklyTarget, monthly_target as monthlyTarget
      FROM machine_settings ORDER BY group_name, machine_name
    `);
    const data = rows.map(row => ({
      ...row,
      weeklyTarget: Number(row.weeklyTarget) || 0,
      monthlyTarget: Number(row.monthlyTarget) || 0
    }));
    res.json({ data, count: data.length });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error', message: error.message });
  } finally {
    if (connection) await connection.end();
  }
});

// Machine Settings - POST (Create)
app.post('/api/machine-settings', async (req, res) => {
  let connection;
  try {
    const { machineName, groupName, weeklyTarget, monthlyTarget } = req.body;
    if (!machineName || !groupName) {
      return res.status(400).json({ error: 'machineName and groupName are required' });
    }
    connection = await getConnection();
    const [result] = await connection.execute(
      `INSERT INTO machine_settings (machine_name, group_name, weekly_target, monthly_target) VALUES (?, ?, ?, ?)`,
      [machineName, groupName, weeklyTarget || 80, monthlyTarget || 80]
    );
    res.status(201).json({ success: true, id: result.insertId });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Machine name already exists' });
    }
    res.status(500).json({ error: 'Internal server error', message: error.message });
  } finally {
    if (connection) await connection.end();
  }
});

// Machine Settings - PUT (Update)
app.put('/api/machine-settings', async (req, res) => {
  let connection;
  try {
    const { id, machineName, groupName, weeklyTarget, monthlyTarget } = req.body;
    if (!id) {
      return res.status(400).json({ error: 'id is required' });
    }
    connection = await getConnection();
    await connection.execute(
      `UPDATE machine_settings SET machine_name = ?, group_name = ?, weekly_target = ?, monthly_target = ? WHERE id = ?`,
      [machineName, groupName, weeklyTarget, monthlyTarget, id]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error', message: error.message });
  } finally {
    if (connection) await connection.end();
  }
});

// Machine Settings - DELETE
app.delete('/api/machine-settings', async (req, res) => {
  let connection;
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ error: 'id is required' });
    }
    connection = await getConnection();
    await connection.execute(`DELETE FROM machine_settings WHERE id = ?`, [id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error', message: error.message });
  } finally {
    if (connection) await connection.end();
  }
});

// Timeline Data
app.get('/api/timeline-data', async (req, res) => {
  let connection;
  try {
    const { from, to } = req.query;
    if (!from || !to) {
      return res.status(400).json({ error: 'from and to query parameters are required' });
    }

    connection = await getConnection();
    const fromDate = new Date(from).toISOString().slice(0, 19).replace('T', ' ');
    const toDate = new Date(to).toISOString().slice(0, 19).replace('T', ' ');

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
        END, 2) as actualRatio1,
        ROUND(CASE
          WHEN (COALESCE(rs.total_run, 0) + COALESCE(rs.total_stop, 0)) > 0
          THEN (COALESCE(rs.total_run, 0) / (COALESCE(rs.total_run, 0) + COALESCE(rs.total_stop, 0))) * 100
          ELSE 0
        END, 2) as trueRatio1
      FROM machine_settings ms
      LEFT JOIN range_stats rs ON ms.machine_name = rs.machine_name
      ORDER BY ms.group_name, ms.machine_name
    `;

    const [rows] = await connection.execute(sql, [fromDate, toDate]);
    const data = rows.map(row => ({
      machineName: row.machineName,
      groupName: row.groupName,
      weeklyTarget: Number(row.weeklyTarget) || 0,
      monthlyTarget: Number(row.monthlyTarget) || 0,
      runHour: Number(row.runHour) || 0,
      stopHour: Number(row.stopHour) || 0,
      actualRatio1: Number(row.actualRatio1) || 0,
      trueRatio1: Number(row.trueRatio1) || 0
    }));

    res.json({ data, count: data.length });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error', message: error.message });
  } finally {
    if (connection) await connection.end();
  }
});

// Timeline Segments
app.get('/api/timeline-segments', async (req, res) => {
  let connection;
  try {
    const { from, to } = req.query;
    if (!from || !to) {
      return res.status(400).json({ error: 'from and to query parameters are required' });
    }

    connection = await getConnection();
    const fromDate = new Date(from).toISOString().slice(0, 19).replace('T', ' ');
    const toDate = new Date(to).toISOString().slice(0, 19).replace('T', ' ');

    const sql = `
      SELECT
        machine_name as machineName,
        run_hour as runHour,
        stop_hour as stopHour,
        run_status as runStatus,
        stop_status as stopStatus,
        rework_status as reworkStatus,
        log_time as logTime
      FROM machine_hours
      WHERE log_time BETWEEN ? AND ?
      ORDER BY machine_name, log_time
    `;

    const [rows] = await connection.execute(sql, [fromDate, toDate]);
    const data = rows.map(row => ({
      ...row,
      runHour: Number(row.runHour) || 0,
      stopHour: Number(row.stopHour) || 0
    }));

    res.json({ data, count: data.length });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error', message: error.message });
  } finally {
    if (connection) await connection.end();
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
  console.log(`  Started:   ${new Date().toLocaleString()}`);
  console.log('='.repeat(50));
});
