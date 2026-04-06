import { db } from '../src/lib/db';
import { sql } from 'drizzle-orm';

function main() {
  console.log('Setting up task count triggers...');

  try {
    // 1. Ensure table exists (though schema push should have handled it)
    db.run(sql`
      CREATE TABLE IF NOT EXISTS task_counts (
        id INTEGER PRIMARY KEY,
        count INTEGER NOT NULL DEFAULT 0
      )
    `);

    // 2. Drop existing triggers to ensure clean state
    db.run(sql`DROP TRIGGER IF EXISTS update_task_count_insert`);
    db.run(sql`DROP TRIGGER IF EXISTS update_task_count_delete`);

    // 3. Create Insert Trigger
    db.run(sql`
      CREATE TRIGGER update_task_count_insert
      AFTER INSERT ON tasks
      BEGIN
        UPDATE task_counts SET count = count + 1 WHERE id = 1;
      END;
    `);

    // 4. Create Delete Trigger
    db.run(sql`
      CREATE TRIGGER update_task_count_delete
      AFTER DELETE ON tasks
      BEGIN
        UPDATE task_counts SET count = count - 1 WHERE id = 1;
      END;
    `);

    // 5. Initialize/Reset Count
    // Use an IIFE or normal closure to avoid returning a Promise since better-sqlite3 throws if so
    db.transaction((tx) => {
      tx.run(sql`DELETE FROM task_counts`);
      tx.run(sql`
        INSERT INTO task_counts (id, count)
        SELECT 1, COUNT(*) FROM tasks
      `);
      return;
    });


    console.log('Setting up FTS5 virtual table and triggers...');

    // Create FTS5 virtual table
    db.run(sql`
      CREATE VIRTUAL TABLE IF NOT EXISTS tasks_fts USING fts5(
        name,
        description,
        content='tasks',
        content_rowid='id'
      )
    `);

    // Drop existing FTS5 triggers to ensure clean state
    db.run(sql`DROP TRIGGER IF EXISTS tasks_fts_insert`);
    db.run(sql`DROP TRIGGER IF EXISTS tasks_fts_delete`);
    db.run(sql`DROP TRIGGER IF EXISTS tasks_fts_update`);

    // Create FTS5 Insert Trigger
    db.run(sql`
      CREATE TRIGGER tasks_fts_insert AFTER INSERT ON tasks
      BEGIN
        INSERT INTO tasks_fts(rowid, name, description) VALUES (new.id, new.name, new.description);
      END;
    `);

    // Create FTS5 Delete Trigger
    db.run(sql`
      CREATE TRIGGER tasks_fts_delete AFTER DELETE ON tasks
      BEGIN
        INSERT INTO tasks_fts(tasks_fts, rowid, name, description) VALUES ('delete', old.id, old.name, old.description);
      END;
    `);

    // Create FTS5 Update Trigger
    db.run(sql`
      CREATE TRIGGER tasks_fts_update AFTER UPDATE ON tasks
      BEGIN
        INSERT INTO tasks_fts(tasks_fts, rowid, name, description) VALUES ('delete', old.id, old.name, old.description);
        INSERT INTO tasks_fts(rowid, name, description) VALUES (new.id, new.name, new.description);
      END;
    `);

    // Initialize/Reset FTS5 data
    db.transaction((tx) => {
      // Rebuild the entire FTS index
      tx.run(sql`INSERT INTO tasks_fts(tasks_fts) VALUES('rebuild')`);
      return;
    });

    console.log('Task count triggers setup complete.');
  } catch (error) {
    console.error('Failed to setup triggers:', error);
    process.exit(1);
  }
}

main();
