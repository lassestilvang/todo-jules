import Database from 'better-sqlite3';
import * as fs from 'fs';
import * as path from 'path';

const sqlite = new Database('sqlite.db');

async function main() {
  console.log('Applying index migration...');

  const migration = fs.readFileSync(path.join('drizzle', '0004_lame_ender_wiggin.sql'), 'utf-8');
  sqlite.exec(migration);

  console.log('Index migration applied successfully.');
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
