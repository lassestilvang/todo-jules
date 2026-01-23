
import { db } from '../src/lib/db';
import { tasks } from '../src/lib/schema';

async function seed() {
  console.log('Seeding 5000 tasks...');
  const newTasks = [];
  for (let i = 0; i < 5000; i++) {
    newTasks.push({
      name: `Benchmark Task ${i}`,
      description: `Description for task ${i}`,
      priority: 'Medium',
      listId: null, // Inbox
    });
  }

  // Batch insert
  const batchSize = 500;
  for (let i = 0; i < newTasks.length; i += batchSize) {
    await db.insert(tasks).values(newTasks.slice(i, i + batchSize));
    process.stdout.write('.');
  }
  console.log('\nSeeding complete.');
}

seed().catch(console.error);
