/**
 * PM2 Ecosystem Configuration
 * Machine Monitoring System - Production
 */

module.exports = {
  apps: [
    {
      name: 'machine-monitoring',
      script: './server.cjs',
      cwd: __dirname,

      // Environment
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },

      // Instances & Mode
      instances: 1,           // จำนวน instances (ใช้ 'max' สำหรับ cluster mode)
      exec_mode: 'fork',      // 'fork' หรือ 'cluster'

      // Auto-restart
      watch: false,           // ไม่ต้อง watch ใน production
      autorestart: true,      // Auto restart เมื่อ crash
      max_restarts: 10,       // จำกัดจำนวน restart
      restart_delay: 5000,    // รอ 5 วินาทีก่อน restart

      // Memory Management
      max_memory_restart: '500M',  // Restart เมื่อใช้ memory เกิน 500MB

      // Logs
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      merge_logs: true,

      // Graceful shutdown
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000
    }
  ]
};
