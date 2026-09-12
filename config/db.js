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

// Database connectivity verification & auto-table provisioning
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log(`[Database] MySQL connected successfully to '${dbConfig.database}' on ${dbConfig.host}:${dbConfig.port}`);
    
    // Auto-provision event_rsvps table if not present
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`event_rsvps\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`event_id\` INT NOT NULL,
        \`user_id\` INT NULL,
        \`guest_name\` VARCHAR(255) NOT NULL,
        \`guest_email\` VARCHAR(255) NOT NULL,
        \`guest_phone\` VARCHAR(50) NULL,
        \`attending_count\` INT DEFAULT 1,
        \`special_requests\` TEXT NULL,
        \`status\` ENUM('confirmed', 'waitlist', 'cancelled') DEFAULT 'confirmed',
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX \`idx_event_id\` (\`event_id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Auto-provision active_sessions table if not present
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`active_sessions\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`user_id\` INT NOT NULL,
        \`refresh_token_hash\` VARCHAR(64) NOT NULL,
        \`device_info\` VARCHAR(255) DEFAULT 'Browser',
        \`ip_address\` VARCHAR(50) DEFAULT '127.0.0.1',
        \`expires_at\` DATETIME NOT NULL,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX \`idx_user_id\` (\`user_id\`),
        INDEX \`idx_token_hash\` (\`refresh_token_hash\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Auto-provision newsletter_subscribers table if not present
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`newsletter_subscribers\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`email\` VARCHAR(255) NOT NULL UNIQUE,
        \`full_name\` VARCHAR(255) NULL,
        \`status\` ENUM('subscribed', 'unsubscribed') DEFAULT 'subscribed',
        \`subscribed_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`unsubscribe_token\` VARCHAR(64) NULL,
        \`unsubscribed_at\` DATETIME NULL,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX \`idx_subscriber_email\` (\`email\`),
        INDEX \`idx_subscriber_status\` (\`status\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Auto-provision newsletter_subscribers subscribed_at column if not present
    try {
      const [subCols] = await connection.query("SHOW COLUMNS FROM `newsletter_subscribers` LIKE 'subscribed_at'");
      if (subCols.length === 0) {
        await connection.query("ALTER TABLE `newsletter_subscribers` ADD COLUMN `subscribed_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER `status`");
      }
    } catch (e) {
      console.warn('[Database] Optional newsletter_subscribers column check:', e.message);
    }

    // Auto-provision certificates columns if not present
    try {
      const [vHashCols] = await connection.query("SHOW COLUMNS FROM `certificates` LIKE 'verification_hash'");
      if (vHashCols.length === 0) {
        await connection.query("ALTER TABLE `certificates` ADD COLUMN `verification_hash` VARCHAR(128) NULL AFTER `certificate_number`");
      }
      const [isRevCols] = await connection.query("SHOW COLUMNS FROM `certificates` LIKE 'is_revoked'");
      if (isRevCols.length === 0) {
        await connection.query("ALTER TABLE `certificates` ADD COLUMN `is_revoked` TINYINT(1) DEFAULT 0 AFTER `status`");
      }
    } catch (e) {
      console.warn('[Database] Optional certificates column check:', e.message);
    }

    // Auto-provision users columns if not present
    try {
      const [pwdCols] = await connection.query("SHOW COLUMNS FROM `users` LIKE 'must_change_password'");
      if (pwdCols.length === 0) {
        await connection.query("ALTER TABLE `users` ADD COLUMN `must_change_password` TINYINT(1) DEFAULT 0 AFTER `status`");
      }
      const [twoFaCols] = await connection.query("SHOW COLUMNS FROM `users` LIKE 'two_factor_enabled'");
      if (twoFaCols.length === 0) {
        await connection.query("ALTER TABLE `users` ADD COLUMN `two_factor_enabled` TINYINT(1) DEFAULT 0 AFTER `is_verified`");
      }
      const [twoFaSec] = await connection.query("SHOW COLUMNS FROM `users` LIKE 'two_factor_secret'");
      if (twoFaSec.length === 0) {
        await connection.query("ALTER TABLE `users` ADD COLUMN `two_factor_secret` VARCHAR(128) NULL AFTER `two_factor_enabled`");
      }
      const [twoFaBkp] = await connection.query("SHOW COLUMNS FROM `users` LIKE 'two_factor_backup_codes'");
      if (twoFaBkp.length === 0) {
        await connection.query("ALTER TABLE `users` ADD COLUMN `two_factor_backup_codes` TEXT NULL AFTER `two_factor_secret`");
      }
    } catch (e) {
      console.warn('[Database] Optional users column check:', e.message);
    }

    // Auto-provision active_sessions columns if not present
    try {
      const [revCols] = await connection.query("SHOW COLUMNS FROM `active_sessions` LIKE 'is_revoked'");
      if (revCols.length === 0) {
        await connection.query("ALTER TABLE `active_sessions` ADD COLUMN `is_revoked` TINYINT(1) DEFAULT 0 AFTER `expires_at`");
      }
      const [revAtCols] = await connection.query("SHOW COLUMNS FROM `active_sessions` LIKE 'revoked_at'");
      if (revAtCols.length === 0) {
        await connection.query("ALTER TABLE `active_sessions` ADD COLUMN `revoked_at` DATETIME NULL AFTER `is_revoked`");
      }
    } catch (e) {
      console.warn('[Database] Optional active_sessions column check:', e.message);
    }

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
