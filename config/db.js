const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'drodul_phendey_ling_db',
  waitForConnections: true,
  connectionLimit: 20,
  queueLimit: 0,
  multipleStatements: true,
  decimalNumbers: true,
  charset: 'utf8mb4'
};

const pool = mysql.createPool(dbConfig);

// Auto-create database if not exists
async function initializeDatabase() {
  const rootConn = await mysql.createConnection({
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.user,
    password: dbConfig.password,
    multipleStatements: true
  });

  try {
    await rootConn.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
  } finally {
    await rootConn.end();
  }
}

// Helper to execute transactional queries
async function withTransaction(callback) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

// Database connectivity verification
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log(`[Database] MySQL connected successfully to '${dbConfig.database}' on ${dbConfig.host}:${dbConfig.port}`);
    connection.release();
    return true;
  } catch (error) {
    console.error('[Database] Connection failed:', error.message);
    return false;
  }
}

module.exports = {
  pool,
  initializeDatabase,
  withTransaction,
  testConnection
};
