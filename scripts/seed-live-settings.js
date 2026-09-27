const { pool } = require('../config/db');
const { DEFAULT_SETTINGS } = require('../config/defaultSettings');

async function seed() {
  console.log('[Seed] Seeding master site settings into system_settings...');
  let inserted = 0;
  for (const [k, v] of Object.entries(DEFAULT_SETTINGS)) {
    await pool.query(
      `INSERT INTO system_settings (setting_key, setting_value) 
       VALUES (?, ?) 
       ON DUPLICATE KEY UPDATE setting_value = IF(setting_value IS NULL OR setting_value = '', VALUES(setting_value), setting_value)`,
      [k, String(v)]
    );
    inserted++;
  }
  const [count] = await pool.query('SELECT COUNT(*) as c FROM system_settings');
  console.log(`[Seed] Seeded ${inserted} master settings successfully! Total settings in DB:`, count[0].c);
  process.exit(0);
}

seed().catch(e => {
  console.error(e);
  process.exit(1);
});
