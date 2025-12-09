import serverlessMysql from 'serverless-mysql';

const db = serverlessMysql({
  config: {
    host: process.env.DB_HOST || 'REDACTED_HOST',
    port: parseInt(process.env.DB_PORT || '4000'),
    user: process.env.DB_USER || 'REDACTED_USER',
    password: process.env.DB_PASSWORD || 'uOA3PJz4MTMvMkcW',
    database: process.env.DB_NAME || 'test',
    ssl: {}
  }
});

export default db;
