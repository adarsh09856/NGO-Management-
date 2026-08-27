const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT || '3306',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'drodul_phendey_ling_db'
};

async function createBackup() {
  const backupDir = path.join(__dirname, '../backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFile = path.join(backupDir, `dpl_backup_${timestamp}.sql`);

  const passwordFlag = dbConfig.password ? `-p"${dbConfig.password}"` : '';
  const cmd = `mysqldump -h ${dbConfig.host} -P ${dbConfig.port} -u ${dbConfig.user} ${passwordFlag} ${dbConfig.database} > "${backupFile}"`;

  console.log(`[Backup] Exporting database to ${backupFile}...`);

  return new Promise((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.error('[Backup Error] Failed to generate backup:', error.message);
        return reject(error);
      }
      console.log(`[Backup] Database backup completed successfully: ${backupFile}`);
      resolve(backupFile);
    });
  });
}

if (require.main === module) {
  createBackup()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { createBackup };
