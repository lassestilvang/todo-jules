/**
 * Benchmark Script for Reorder Tasks
 *
 * Usage:
 * DB_FILE_NAME=benchmark.db npx tsx scripts/benchmark-reorder.ts
 */

import { db } from '@/lib/db'; // This is now sqlite3 proxy
import { lists, tasks } from '@/lib/schema';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { reorderTasks } from '@/app/actions/reorder';
import { eq } from 'drizzle-orm';
import fs from 'fs';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';

const DB_FILE = process.env.DB_FILE_NAME || 'benchmark.db';

async function runBenchmark() {
  if (!DB_FILE || DB_FILE === 'sqlite.db') {
    // If user forgot to set DB_FILE_NAME or set it to default,
    // we should warn, but actually we can proceed safely if we are careful.
    // However, original logic prevented it.
    console.error('Error: Please set DB_FILE_NAME to a temporary file (e.g., benchmark.db) to avoid modifying the main database.');
    console.error('Example: DB_FILE_NAME=benchmark.db npx tsx scripts/benchmark-reorder.ts');
    process.exit(1);
  }

  console.log(`Using Benchmark DB: ${DB_FILE}`);

  // Clean up
  if (fs.existsSync(DB_FILE)) {
      try {
        fs.unlinkSync(DB_FILE);
      } catch (e) {
          console.warn("Could not delete existing DB file. Usage might append data.");
      }
  }

  // Initialize Schema using better-sqlite3 for synchronous migration
  const sqlite = new Database(DB_FILE);
  const migrationDb = drizzle(sqlite);
  migrate(migrationDb, { migrationsFolder: 'drizzle' });
  sqlite.close();

  // Now use app db (sqlite3 proxy) for benchmark
  // Wait, app db is initialized with DB_FILE_NAME env var at top level of module.
  // So we must rely on process.env being set correctly BEFORE import?
  // Actually, import { db } happens at top. If env var is set in script before execution, it works.
  // But inside tsx execution, env vars must be set externally.

  // Seed Data using app db
  await db.insert(lists).values({ name: 'Bench List', color: 'blue', emoji: '⏱️' });

  // Fetch list
  const [list] = await db.select().from(lists).where(eq(lists.name, 'Bench List'));
  if (!list) {
    throw new Error('Bench List not found');
  }
  const listId = list.id;

  const ITEM_COUNT = 1000;
  const data: any[] = [];
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
    await db.insert(tasks).values(data.slice(i, i + CHUNK_SIZE));
  }

  // Prepare payload (reverse order)
  const allTasks = await db.select().from(tasks).where(eq(tasks.listId, listId));
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
  const [dbItem] = await db.select().from(tasks).where(eq(tasks.id, sample.id));

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
