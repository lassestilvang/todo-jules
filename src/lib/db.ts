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
      const rows: any[] = await new Promise((resolve, reject) => {
        if (method === 'run') {
          // sqlite3 doesn't return rows for run(), so if Drizzle sends an UPDATE with RETURNING
          // as 'run', it's problematic. But Drizzle seems to send 'all' for RETURNING.
          // Let's just use run for run.
          sqlite.run(sql, params, function (err) {
            if (err) reject(err);
            else resolve([]);
          });
        } else if (method === 'all') {
          sqlite.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else {
              // Drizzle map values bug with sqlite-proxy when using objects:
              // For returning clauses, Drizzle expects values array, but for normal select, rows.
              // To safely support both, we can check if it's a returning statement.
              const isReturning = /\sreturning\s/i.test(sql);
              if (isReturning) {
                  const values = rows.map((row: Record<string, unknown>) => Object.values(row));
                  resolve(values);
              } else {
                  resolve(rows);
              }
            }
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
    } catch (e: unknown) {
      console.error('Error executing query:', e);
      throw e;
    }
  },
  { schema }
);
