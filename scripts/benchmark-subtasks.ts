
import { db } from '../src/lib/db';
import { tasks, subtasks } from '../src/lib/schema';
import { eq } from 'drizzle-orm';

async function benchmark() {
  const NUM_TASKS = 500;
  const SUBTASKS_PER_TASK = 100;

  console.log(`Seeding ${NUM_TASKS} tasks and ${NUM_TASKS * SUBTASKS_PER_TASK} subtasks...`);

  // Clean up
  await db.delete(subtasks);
  await db.delete(tasks);

  for (let i = 0; i < NUM_TASKS; i++) {
    const [task] = await db.insert(tasks).values({
      name: `Task ${i}`,
      priority: 'Medium',
    }).returning();

    const subtaskValues = [];
    for (let j = 0; j < SUBTASKS_PER_TASK; j++) {
      subtaskValues.push({
        name: `Subtask ${i}-${j}`,
        taskId: task.id,
      });
    }
    // Batch subtasks
    await db.insert(subtasks).values(subtaskValues);
    if (i % 50 === 0) process.stdout.write('.');
  }
  console.log('\nSeeding complete.');

  // Get some task IDs for testing
  const allTasks = await db.select({ id: tasks.id }).from(tasks).limit(10).all();
  const testTaskIds = allTasks.map(t => t.id);

  console.log(`Running benchmark with ${testTaskIds.length} tasks and 50 iterations...`);
  const iterations = 50;
  let totalTime = 0;

  for (let i = 0; i < iterations; i++) {
    for (const taskId of testTaskIds) {
      const start = performance.now();
      // Use .all() for synchronous better-sqlite3 execution
      db.select().from(subtasks).where(eq(subtasks.taskId, taskId)).all();
      const end = performance.now();
      totalTime += (end - start);
    }
  }

  console.log(`Average query time for subtasks by taskId: ${(totalTime / (iterations * testTaskIds.length)).toFixed(4)}ms`);
}

benchmark().catch(console.error);
