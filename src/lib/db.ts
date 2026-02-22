import { drizzle } from 'drizzle-orm/sqlite-proxy';
import sqlite3 from 'sqlite3';
import * as schema from './schema';

const DB_FILE = process.env.DB_FILE_NAME || 'sqlite.db';

// Use sqlite3.Database
const sqlite = new sqlite3.Database(DB_FILE);

// Enable WAL mode
sqlite.run('PRAGMA journal_mode = WAL');
sqlite.run('PRAGMA foreign_keys = ON');

export const db = drizzle(
  async (sql, params, method) => {
    try {
      const rows: any = await new Promise((resolve, reject) => {
        if (method === 'run') {
          sqlite.run(sql, params, function (err) {
            if (err) reject(err);
            else resolve([]);
          });
        } else if (method === 'all') {
          sqlite.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
          });
        } else if (method === 'get') {
          sqlite.get(sql, params, (err, row) => {
            if (err) reject(err);
            else resolve(row ? [row] : []);
          });
        } else if (method === 'values') {
          sqlite.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else {
              const values = rows.map((row: any) => Object.values(row));
              resolve(values);
            }
          });
        } else {
             // Default to all
             sqlite.all(sql, params, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        }
      });

      return { rows };
    } catch (e: any) {
      console.error('Error executing query:', e);
      throw e;
    }
  },
  { schema }
);
