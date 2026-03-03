import { db } from '../src/lib/db';
import { sql } from 'drizzle-orm';

async function main() {
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
    db.transaction((tx) => {
      tx.run(sql`DELETE FROM task_counts`);
      tx.run(sql`
        INSERT INTO task_counts (id, count)
        SELECT 1, COUNT(*) FROM tasks
      `);
    });

    console.log('Task count triggers setup complete.');
  } catch (error) {
    console.error('Failed to setup triggers:', error);
    process.exit(1);
  }
}

main();
