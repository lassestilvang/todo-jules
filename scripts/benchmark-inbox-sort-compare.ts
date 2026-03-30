import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { desc, isNull } from 'drizzle-orm';
import * as schema from '../src/lib/schema';
import fs from 'fs';

const DB_FILE = 'inbox-bench.db';

async function main() {
  console.log('Using benchmark database...');

  const sqlite = new Database(DB_FILE);
  const db = drizzle(sqlite, { schema });

  // Benchmark
  console.log('Starting benchmark...');
  const iterations = 50;

  // Warmup unbounded
  console.log('Warming up unbounded...');
  for (let i = 0; i < 5; i++) {
    db.select().from(schema.tasks)
      .where(isNull(schema.tasks.listId))
      .orderBy(desc(schema.tasks.createdAt))
      .run();
  }

  const start1 = performance.now();
  for (let i = 0; i < iterations; i++) {
    db.select().from(schema.tasks)
      .where(isNull(schema.tasks.listId))
      .orderBy(desc(schema.tasks.createdAt))
      .all();
  }
  const end1 = performance.now();

  const avgTime1 = (end1 - start1) / iterations;
  console.log(`Average query time (unbounded) over ${iterations} iterations: ${avgTime1.toFixed(4)} ms`);

  // Warmup bounded
  console.log('Warming up bounded (limit 50)...');
  for (let i = 0; i < 5; i++) {
    db.select().from(schema.tasks)
      .where(isNull(schema.tasks.listId))
      .orderBy(desc(schema.tasks.createdAt))
      .limit(50)
      .run();
  }

  const start2 = performance.now();
  for (let i = 0; i < iterations; i++) {
    db.select().from(schema.tasks)
      .where(isNull(schema.tasks.listId))
      .orderBy(desc(schema.tasks.createdAt))
      .limit(50)
      .all();
  }
  const end2 = performance.now();

  const avgTime2 = (end2 - start2) / iterations;
  console.log(`Average query time (limit 50) over ${iterations} iterations: ${avgTime2.toFixed(4)} ms`);
}

main().catch(console.error);
