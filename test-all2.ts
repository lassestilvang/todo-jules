import { db } from './src/lib/db';
import { lists, tasks } from './src/lib/schema';
import { eq } from 'drizzle-orm';

async function run() {
  const t0 = performance.now();
  for (let i = 0; i < 1000; i++) {
    const res = await db.query.tasks.findFirst();
  }
  const t1 = performance.now();
  console.log(`findFirst: ${t1 - t0}ms`);

  const t2 = performance.now();
  for (let i = 0; i < 1000; i++) {
    const res = db.select().from(tasks).limit(1).get();
  }
  const t3 = performance.now();
  console.log(`get: ${t3 - t2}ms`);
}

run();
