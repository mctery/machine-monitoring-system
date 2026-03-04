/**
 * Database Setup Script
 * Creates tables and indexes using mysql2 (replaces prisma db push)
 */

const fs = require('fs');
const mysql = require('mysql2/promise');
const envPath = fs.existsSync('.env.local') ? '.env.local' : '.env';
require('dotenv').config({ path: envPath });

async function setup() {
  const required = ['DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
  const missing = required.filter(key => !process.env[key]);
  if (missing.length > 0) {
    console.error(`Missing environment variables: ${missing.join(', ')}`);
    process.exit(1);
  }

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined
  });

  try {
    console.log(`Connected to ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);

    // Create machine_hours table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS machine_hours (
        id INT AUTO_INCREMENT PRIMARY KEY,
        log_time DATETIME NOT NULL,
        machine_name VARCHAR(50) NOT NULL,
        run_hour FLOAT NOT NULL,
        stop_hour FLOAT NOT NULL,
        run_status TINYINT NOT NULL,
        stop_status TINYINT NOT NULL,
        rework_status INT NULL,
        INDEX idx_machine_time (machine_name, log_time)
      )
    `);
    console.log('  Created table: machine_hours');

    // Create machine_settings table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS machine_settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        machine_name VARCHAR(50) NOT NULL UNIQUE,
        group_name VARCHAR(50) NOT NULL,
        weekly_target FLOAT DEFAULT 80,
        monthly_target FLOAT DEFAULT 80,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_group_name (group_name)
      )
    `);
    console.log('  Created table: machine_settings');

    console.log('Database setup complete!');
  } catch (error) {
    console.error('Setup failed:', error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

setup();
