const fs = require('fs');
const path = require('path');
const { pool, initializeDatabase } = require('../config/db');

async function runSeeder() {
  console.log('[Seeder] Starting MySQL database seeding...');
  try {
    await initializeDatabase();

    const seedPath = path.join(__dirname, 'seed.sql');
    if (!fs.existsSync(seedPath)) {
      throw new Error(`seed.sql not found at ${seedPath}`);
    }

    const seedSql = fs.readFileSync(seedPath, 'utf8');

    const connection = await pool.getConnection();
    try {
      console.log('[Seeder] Executing seed.sql...');
      await connection.query(seedSql);
      console.log('[Seeder] Database seeded successfully with realistic data!');
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('[Seeder Error] Seeding failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  runSeeder();
}

module.exports = { runSeeder };
