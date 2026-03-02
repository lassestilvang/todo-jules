import { POST } from '../src/app/api/tasks/route';
import { db } from '../src/lib/db';
import { labels, tasks, subtasks, taskLabels, reminders, attachments } from '../src/lib/schema';
import { eq } from 'drizzle-orm';

async function benchmark() {
  console.log('Starting benchmark: Task Creation (Sequential vs Parallel candidate)...');

  // Need to seed labels first because of FK constraints
  console.log('Seeding labels...');
  try {
      const existingLabels = await db.select().from(labels).limit(5);
      if (existingLabels.length < 5) {
          const newLabels = Array.from({ length: 5 - existingLabels.length }, (_, i) => ({
              name: `Benchmark Label ${i}`,
              color: '#000000',
              icon: 'default'
          }));
          await db.insert(labels).values(newLabels);
      }
  } catch (e) {
      console.warn('Labels check/seed failed:', e);
  }

  // Get label IDs to use
  const allLabels = await db.select().from(labels).limit(5);
  const labelIds = allLabels.map(l => l.id);

  if (labelIds.length === 0) {
      console.error('No labels available to test with.');
      return;
  }

  const iterations = 50;
  const times: number[] = [];

  console.log(`Running ${iterations} iterations...`);

  for (let i = 0; i < iterations; i++) {
    const payload = {
        name: `Benchmark Task ${i}`,
        description: 'A task with many dependencies to test insert performance',
        priority: 'High',
        // 10 Subtasks
        subtasks: Array.from({ length: 10 }, (_, j) => ({ name: `Subtask ${j}` })),
        // 5 Labels
        labels: labelIds,
        // 5 Reminders
        reminders: Array.from({ length: 5 }, (_, j) => ({ remindAt: new Date(Date.now() + 86400000 * (j + 1)).toISOString() })),
        // 5 Attachments
        attachments: Array.from({ length: 5 }, (_, j) => ({ url: `https://example.com/file${j}.pdf` })),
    };

    const req = new Request('http://localhost/api/tasks', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    const start = performance.now();
    const res = await POST(req);
    const end = performance.now();

    const duration = end - start;

    if (res.status === 201) {
        times.push(duration);
    } else {
        console.error(`Failed iteration ${i}:`, await res.json());
    }

    if ((i + 1) % 10 === 0) process.stdout.write('.');
  }
  console.log('\n');

  if (times.length === 0) {
      console.log('No successful requests.');
      return;
  }

  const average = times.reduce((a, b) => a + b, 0) / times.length;
  const min = Math.min(...times);
  const max = Math.max(...times);

  console.log(`Results for ${times.length} successful tasks:`);
  console.log(`Average: ${average.toFixed(2)} ms`);
  console.log(`Min: ${min.toFixed(2)} ms`);
  console.log(`Max: ${max.toFixed(2)} ms`);
  console.log(`Total time: ${(times.reduce((a, b) => a + b, 0)).toFixed(2)} ms`);
}

benchmark().catch(console.error);
