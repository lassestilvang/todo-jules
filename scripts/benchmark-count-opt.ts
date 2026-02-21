import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { count, eq } from 'drizzle-orm';

// Define minimal schema for benchmark
const tasks = sqliteTable('tasks', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
});

const taskCounts = sqliteTable('task_counts', {
  id: integer('id').primaryKey(),
  count: integer('count').notNull().default(0),
});

// Setup DB
const dbFile = 'bench-count-opt.db';
const sqlite = new Database(dbFile);
const db = drizzle(sqlite);

async function benchmark() {
  console.log('Preparing OPTIMIZED benchmark DB...');
  sqlite.exec('DROP TABLE IF EXISTS tasks');
  sqlite.exec('DROP TABLE IF EXISTS task_counts');
  sqlite.exec('CREATE TABLE tasks (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL)');
  sqlite.exec('CREATE TABLE task_counts (id INTEGER PRIMARY KEY, count INTEGER NOT NULL DEFAULT 0)');

  // Create Triggers
  sqlite.exec(`
    CREATE TRIGGER update_task_count_insert
    AFTER INSERT ON tasks
    BEGIN
      UPDATE task_counts SET count = count + 1 WHERE id = 1;
    END;
  `);
  sqlite.exec(`
    CREATE TRIGGER update_task_count_delete
    AFTER DELETE ON tasks
    BEGIN
      UPDATE task_counts SET count = count - 1 WHERE id = 1;
    END;
  `);

  // Init count
  sqlite.exec('INSERT INTO task_counts (id, count) VALUES (1, 0)');

  // Insert 1,000,000 rows
  const TOTAL_ROWS = 1000000;

  sqlite.exec('BEGIN');
  const stmt = sqlite.prepare('INSERT INTO tasks (name) VALUES (?)');
  for (let i = 0; i < TOTAL_ROWS; i++) {
    stmt.run(`Task ${i}`);
  }
  sqlite.exec('COMMIT');
  console.log(`Inserted ${TOTAL_ROWS} rows.`);

  // Measure optimized getTaskCount logic
  const start = performance.now();
  // Run 100 times to see if it's consistently fast
  for(let i=0; i<100; i++) {
      const [result] = await db.select().from(taskCounts).where(eq(taskCounts.id, 1));
      if (!result) throw new Error('No count found');
  }
  const end = performance.now();
  console.log(`Average OPTIMIZED Count time: ${((end - start) / 100).toFixed(4)}ms`);
}

benchmark();
