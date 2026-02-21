import { db } from '../src/lib/db';
import { tasks } from '../src/lib/schema';

async function benchmark() {
  console.log('Starting concurrency benchmark (5 seconds)...');

  let maxLag = 0;
  let totalLag = 0;
  let checks = 0;
  const intervalTime = 10; // ms
  let lastTime = performance.now();

  const timer = setInterval(() => {
    const now = performance.now();
    const lag = now - lastTime - intervalTime;
    if (lag > maxLag) maxLag = lag;
    totalLag += Math.max(0, lag);
    checks++;
    lastTime = now;
  }, intervalTime);

  const start = performance.now();
  let operations = 0;

  // We loop for 5 seconds
  while (performance.now() - start < 5000) {
    // This query is synchronous with better-sqlite3, blocking the loop.
    // It should be async with libsql, allowing the interval to fire.
    await db.select().from(tasks).limit(100);
    operations++;
  }

  clearInterval(timer);

  console.log('Benchmark finished.');
  console.log(`Total DB Operations: ${operations}`);
  console.log(`Interval Checks: ${checks} (Expected ~${5000 / intervalTime})`);

  if (checks > 0) {
    console.log(`Max Event Loop Lag: ${maxLag.toFixed(2)}ms`);
    console.log(`Average Lag: ${(totalLag / checks).toFixed(2)}ms`);
  } else {
    console.log('Max Event Loop Lag: INFINITE (Main thread was completely blocked)');
    console.log('Average Lag: INFINITE');
  }
}

benchmark().catch(console.error);
