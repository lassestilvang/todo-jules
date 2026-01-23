
/**
 * Benchmark Script for Reorder Tasks
 *
 * Usage:
 * DB_FILE_NAME=benchmark.db npx tsx scripts/benchmark-reorder.ts
 */

import { db } from '@/lib/db';
import { lists, tasks } from '@/lib/schema';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { reorderTasks } from '@/app/actions/reorder';
import { eq } from 'drizzle-orm';
import fs from 'fs';

const DB_FILE = process.env.DB_FILE_NAME;

async function runBenchmark() {
  if (!DB_FILE || DB_FILE === 'sqlite.db') {
    console.error('Error: Please set DB_FILE_NAME to a temporary file (e.g., benchmark.db) to avoid modifying the main database.');
    console.error('Example: DB_FILE_NAME=benchmark.db npx tsx scripts/benchmark-reorder.ts');
    process.exit(1);
  }

  console.log(`Using Benchmark DB: ${DB_FILE}`);

  // Best effort cleanup (file might be locked if db imported already)
  if (fs.existsSync(DB_FILE)) {
      try {
        fs.unlinkSync(DB_FILE);
      } catch (e) {
          console.warn("Could not delete existing DB file. Usage might append data.");
      }
  }

  // Initialize Schema
  await migrate(db, { migrationsFolder: 'drizzle' });

  // Seed Data
  db.insert(lists).values({ name: 'Bench List', color: 'blue', emoji: '⏱️' }).run();

  // We need to fetch the list ID in case it's not 1 (if appending)
  const list = db.select().from(lists).where(eq(lists.name, 'Bench List')).get();
  const listId = list.id;

  const ITEM_COUNT = 1000;
  const data = [];
  for (let i = 0; i < ITEM_COUNT; i++) {
    data.push({
      name: `Task ${i}`,
      listId: listId,
      order: i,
    });
  }

  // Batch insert
  const CHUNK_SIZE = 100;
  for (let i = 0; i < data.length; i += CHUNK_SIZE) {
    db.insert(tasks).values(data.slice(i, i + CHUNK_SIZE)).run();
  }

  // Prepare payload (reverse order)
  // Only select tasks for this list
  const allTasks = db.select().from(tasks).where(eq(tasks.listId, listId)).all();
  const items = allTasks.map((t, index) => ({
    id: t.id,
    order: ITEM_COUNT - 1 - index
  }));

  console.log(`Starting benchmark with ${items.length} items...`);

  const start = performance.now();
  const result = await reorderTasks(items);
  const end = performance.now();

  console.log(`Time taken: ${(end - start).toFixed(2)}ms`);

  if (!result.success) {
      console.log('(Note: "Failed to reorder tasks" error is expected due to revalidatePath outside Next.js)');
  }

  // Verify
  const sample = items[0];
  const dbItem = db.select().from(tasks).where(eq(tasks.id, sample.id)).get();

  if (dbItem && dbItem.order === sample.order) {
      console.log('Verification: SUCCESS (Order updated correctly)');
  } else {
      console.error(`Verification: FAILED. Expected ${sample.order}, got ${dbItem?.order}`);
  }

  // Cleanup
  if (fs.existsSync(DB_FILE)) {
      try {
        fs.unlinkSync(DB_FILE);
      } catch (e) {}
  }
}

runBenchmark().catch(console.error);
