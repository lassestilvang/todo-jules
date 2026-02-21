import { db } from '../src/lib/db';
import { sql } from 'drizzle-orm';

async function main() {
  console.log('Setting up task count triggers...');

  try {
    // 1. Ensure table exists (though schema push should have handled it)
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS task_counts (
        id INTEGER PRIMARY KEY,
        count INTEGER NOT NULL DEFAULT 0
      )
    `);

    // 2. Drop existing triggers to ensure clean state
    await db.run(sql`DROP TRIGGER IF EXISTS update_task_count_insert`);
    await db.run(sql`DROP TRIGGER IF EXISTS update_task_count_delete`);

    // 3. Create Insert Trigger
    await db.run(sql`
      CREATE TRIGGER update_task_count_insert
      AFTER INSERT ON tasks
      BEGIN
        UPDATE task_counts SET count = count + 1 WHERE id = 1;
      END;
    `);

    // 4. Create Delete Trigger
    await db.run(sql`
      CREATE TRIGGER update_task_count_delete
      AFTER DELETE ON tasks
      BEGIN
        UPDATE task_counts SET count = count - 1 WHERE id = 1;
      END;
    `);

    // 5. Initialize/Reset Count
    await db.run(sql`DELETE FROM task_counts`);
    await db.run(sql`
      INSERT INTO task_counts (id, count)
      SELECT 1, COUNT(*) FROM tasks
    `);

    console.log('Task count triggers setup complete.');
  } catch (error) {
    console.error('Failed to setup triggers:', error);
    process.exit(1);
  }
}

main();
