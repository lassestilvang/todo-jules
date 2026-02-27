import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';

const DB_FILE = process.env.DB_FILE_NAME || 'sqlite.db';

// Use better-sqlite3 for synchronous operations
const sqlite = new Database(DB_FILE);

// Enable WAL mode
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('foreign_keys = ON');

export const db = drizzle(sqlite, { schema });
