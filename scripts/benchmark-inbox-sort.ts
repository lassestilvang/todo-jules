import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { desc, isNull } from 'drizzle-orm';
import * as schema from '../src/lib/schema';
import fs from 'fs';
import { execSync } from 'child_process';

const DB_FILE = 'inbox-bench.db';

async function main() {
  console.log('Initializing benchmark database...');

  // Clean up previous run
  if (fs.existsSync(DB_FILE)) {
    fs.unlinkSync(DB_FILE);
  }

  // Push schema using drizzle-kit
  console.log('Pushing schema...');
  try {
    execSync('npx drizzle-kit push --config=drizzle.inbox-bench.config.ts', { stdio: 'inherit' });
  } catch (e) {
    console.error('Failed to push schema:', e);
    process.exit(1);
  }

  const sqlite = new Database(DB_FILE);
  const db = drizzle(sqlite, { schema });

  // Seed data
  console.log('Seeding 100,000 tasks...');
  const tasksToInsert: any[] = []; // eslint-disable-line @typescript-eslint/no-explicit-any
  const now = Date.now();

  // Create list first
  db.insert(schema.lists).values({
    name: 'List 1',
    color: '#000000',
    emoji: '📝',
  }).run();

  // 50k Inbox tasks (listId: null)
  for (let i = 0; i < 50000; i++) {
    tasksToInsert.push({
      name: `Inbox Task ${i}`,
      listId: null,
      createdAt: new Date(now - Math.floor(Math.random() * 10000000000)), // Random date within ~4 months
      updatedAt: new Date(),
    });
  }

  // 50k List tasks (listId: 1)
  for (let i = 0; i < 50000; i++) {
    tasksToInsert.push({
      name: `List Task ${i}`,
      listId: 1,
      createdAt: new Date(now - Math.floor(Math.random() * 10000000)),
      updatedAt: new Date(),
    });
  }

  // Batch insert
  const BATCH_SIZE = 200;
  for (let i = 0; i < tasksToInsert.length; i += BATCH_SIZE) {
    db.insert(schema.tasks).values(tasksToInsert.slice(i, i + BATCH_SIZE)).run();
    if ((i + BATCH_SIZE) % 10000 === 0) console.log(`Inserted ${Math.min(i + BATCH_SIZE, tasksToInsert.length)} tasks...`);
  }
  console.log('Seeding complete.');

  // Benchmark
  console.log('Starting benchmark...');
  const iterations = 50;

  // Warmup
  console.log('Warming up...');
  for (let i = 0; i < 5; i++) {
    db.select().from(schema.tasks)
      .where(isNull(schema.tasks.listId))
      .orderBy(desc(schema.tasks.createdAt))
      .run();
  }

  const start = performance.now();
  for (let i = 0; i < iterations; i++) {
    db.select().from(schema.tasks)
      .where(isNull(schema.tasks.listId))
      .orderBy(desc(schema.tasks.createdAt))
      .all();
  }
  const end = performance.now();

  const avgTime = (end - start) / iterations;
  console.log(`Average query time over ${iterations} iterations: ${avgTime.toFixed(4)} ms`);
}

main().catch(console.error);
