const fs = require('fs');
const path = require('path');
const { pool, initializeDatabase } = require('../config/db');

async function runMigrations() {
  console.log('[Migration] Starting MySQL database migrations...');
  try {
    await initializeDatabase();

    const connection = await pool.getConnection();
    try {
      // 1. Ensure base schema migrations table exists
      await connection.query(`
        CREATE TABLE IF NOT EXISTS schema_migrations (
          id INT AUTO_INCREMENT PRIMARY KEY,
          version VARCHAR(100) NOT NULL UNIQUE,
          description VARCHAR(255) NOT NULL,
          applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      // 2. Run base schema.sql
      const schemaPath = path.join(__dirname, 'schema.sql');
      if (fs.existsSync(schemaPath)) {
        console.log('[Migration] Executing baseline schema.sql...');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');
        await connection.query(schemaSql);
      }

      // 3. Scan and execute incremental migrations in db/migrations/
      const migrationsDir = path.join(__dirname, 'migrations');
      if (fs.existsSync(migrationsDir)) {
        const files = fs.readdirSync(migrationsDir)
          .filter(file => file.endsWith('.sql'))
          .sort();

        for (const file of files) {
          const version = path.basename(file, '.sql');
          const [applied] = await connection.query(
            'SELECT id FROM schema_migrations WHERE version = ?',
            [version]
          );

          if (applied.length === 0) {
            console.log(`[Migration] Applying incremental migration: ${file}...`);
            const migrationSql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
            await connection.query(migrationSql);
            await connection.query(
              'INSERT IGNORE INTO schema_migrations (version, description) VALUES (?, ?)',
              [version, `Applied migration ${file}`]
            );
            console.log(`[Migration] Successfully applied: ${file}`);
          } else {
            console.log(`[Migration] Skipping already applied migration: ${file}`);
          }
        }
      }

      console.log('[Migration] All tables and incremental migrations applied successfully!');
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
