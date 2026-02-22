import { GET } from '../src/app/api/search/route';
import { db } from '../src/lib/db';
import { tasks } from '../src/lib/schema';
import { count } from 'drizzle-orm';

async function seed(targetCount: number) {
  const currentCountResult = await db.select({ count: count() }).from(tasks);
  const currentCount = currentCountResult[0].count;

  if (currentCount >= targetCount) {
    console.log(`Database already has ${currentCount} tasks. Skipping seed.`);
    return;
  }

  console.log(`Seeding tasks to reach ${targetCount}...`);
  const batchSize = 1000;
  const needed = targetCount - currentCount;

  for (let i = 0; i < needed; i += batchSize) {
    const batch = [];
    const size = Math.min(batchSize, needed - i);
    for (let j = 0; j < size; j++) {
      batch.push({
        name: `Task ${currentCount + i + j} - ${Math.random().toString(36).substring(7)}`,
        description: `Description for task ${currentCount + i + j} with some random text ${Math.random().toString(36).substring(7)}`,
        priority: 'Medium',
        listId: null,
      });
    }
    await db.insert(tasks).values(batch);
    process.stdout.write('.');
  }
  console.log('\nSeeding complete.');
}

async function benchmark() {
  const TARGET_COUNT = 100000; // 10k for noticeable impact
  await seed(TARGET_COUNT);

  console.log('Starting benchmark...');

  const queries = ['Task', 'Description', 'random', '999', 'Meeting'];
  let totalDuration = 0;
  const iterations = 5;

  for (const query of queries) {
    let queryDuration = 0;
    for (let i = 0; i < iterations; i++) {
      // Mock Request
      const req = new Request(`http://localhost/api/search?query=${query}`);

      const start = performance.now();
      //
      await GET(req);
      const end = performance.now();

      queryDuration += (end - start);
    }
    const avg = queryDuration / iterations;
    console.log(`Query "${query}": ${avg.toFixed(2)}ms (avg of ${iterations})`);
    totalDuration += queryDuration;
  }

  console.log(`Total time for ${queries.length * iterations} queries: ${totalDuration.toFixed(2)}ms`);
  console.log(`Average per query: ${(totalDuration / (queries.length * iterations)).toFixed(2)}ms`);
}

benchmark().catch(console.error);
