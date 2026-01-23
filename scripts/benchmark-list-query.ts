import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from '../src/lib/schema';
import { eq } from 'drizzle-orm';
import { lists, tasks } from '../src/lib/schema';

const DB_FILE = 'bench.db';

async function main() {
  console.log('Initializing benchmark database...');
  const sqlite = new Database(DB_FILE);
  const db = drizzle(sqlite, { schema });

  // Check if data exists
  try {
    const listCount = db.select({ count: count() }).from(schema.lists).get()?.count ?? 0;

    if (listCount === 0) {
        console.log('Seeding data...');
        // Seed 100 lists
        const listsToInsert = [];
        for (let i = 0; i < 100; i++) {
        listsToInsert.push({
            name: `List ${i}`,
            color: '#000000',
            emoji: '📝',
        });
        }
        db.insert(lists).values(listsToInsert).run();

        // Get list IDs
        const allLists = db.query.lists.findMany();

        // Seed 10,000 tasks (100 per list)
        console.log('Seeding 10,000 tasks...');
        const tasksToInsert = [];
        for (const list of allLists) {
        for (let j = 0; j < 100; j++) {
            tasksToInsert.push({
            name: `Task ${list.id}-${j}`,
            listId: list.id,
            priority: 'Medium',
            });
        }
        }

        // Batch insert tasks to avoid limits
        const BATCH_SIZE = 500;
        for (let i = 0; i < tasksToInsert.length; i += BATCH_SIZE) {
        db.insert(tasks).values(tasksToInsert.slice(i, i + BATCH_SIZE)).run();
        }
        console.log('Seeding complete.');
    } else {
        console.log('Data already exists, skipping seed.');
    }

    // Benchmark
    console.log('Starting benchmark...');
    const iterations = 100;
    const targetListId = 50; // Middle of the pack

    // Warmup
    db.query.tasks.findMany({
        where: eq(tasks.listId, targetListId),
        with: {
            subtasks: true,
            labels: { with: { label: true } },
            reminders: true,
            attachments: true,
        }
    });

    const start = performance.now();
    for (let i = 0; i < iterations; i++) {
        db.query.tasks.findMany({
        where: eq(tasks.listId, targetListId),
        with: {
            subtasks: true,
            labels: { with: { label: true } },
            reminders: true,
            attachments: true,
        }
        });
    }
    const end = performance.now();

    const avgTime = (end - start) / iterations;
    console.log(`Average query time over ${iterations} iterations: ${avgTime.toFixed(4)} ms`);
  } catch (e) {
      console.error('Error running benchmark. Ensure database is migrated.', e);
  }
}

main().catch(console.error);
