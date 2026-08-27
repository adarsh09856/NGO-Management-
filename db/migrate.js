const fs = require('fs');
const path = require('path');
const { pool, initializeDatabase } = require('../config/db');

async function runMigrations() {
  console.log('[Migration] Starting MySQL database migrations...');
  try {
    await initializeDatabase();

    const schemaPath = path.join(__dirname, 'schema.sql');
    if (!fs.existsSync(schemaPath)) {
      throw new Error(`schema.sql not found at ${schemaPath}`);
    }

    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    const connection = await pool.getConnection();
    try {
      console.log('[Migration] Executing schema.sql...');
      await connection.query(schemaSql);
      console.log('[Migration] All tables and constraints migrated successfully!');
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('[Migration Error] Migration failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  runMigrations();
}

module.exports = { runMigrations };
