import { getTaskCount, invalidateTaskCountCache } from '@/lib/cache';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';
import { taskCounts } from '@/lib/schema';

const ITERATIONS = 1000;

async function setup() {
  console.log('Setting up benchmark DB...');
  // Ensure task_counts table exists and has data
  try {
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS task_counts (
        id INTEGER PRIMARY KEY,
        count INTEGER NOT NULL DEFAULT 0
      )
    `);

    // Insert initial count if not exists
    const [existing] = await db.select().from(taskCounts);
    if (!existing) {
      await db.insert(taskCounts).values({ id: 1, count: 42 });
    }
  } catch (e) {
    console.error('Setup failed:', e);
    process.exit(1);
  }
}

async function runBenchmark() {
  await setup();

  console.log(`Starting benchmark with ${ITERATIONS} iterations...`);

  const start = performance.now();

  for (let i = 0; i < ITERATIONS; i++) {
    invalidateTaskCountCache(); // Force DB read
    await getTaskCount();
  }

  const end = performance.now();
  const totalTime = end - start;
  const avgTime = totalTime / ITERATIONS;

  console.log(`Total time: ${totalTime.toFixed(2)}ms`);
  console.log(`Average time per call: ${avgTime.toFixed(4)}ms`);
}

runBenchmark().catch(console.error);
