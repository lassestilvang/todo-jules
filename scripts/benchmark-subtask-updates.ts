import { db } from '../src/lib/db';
import { tasks, subtasks } from '../src/lib/schema';
import { eq, sql, inArray } from 'drizzle-orm';

async function runBenchmark() {
  const [task] = await db.insert(tasks).values({
    name: 'Parent Task',
    priority: 'Medium',
  }).returning();

  const taskId = task.id;

  const SUBTASKS_COUNT = 500;
  console.log(`Seeding ${SUBTASKS_COUNT} subtasks...`);

  const subtaskValues = [];
  for (let j = 0; j < SUBTASKS_COUNT; j++) {
    subtaskValues.push({
      name: `Subtask ${j}`,
      taskId: taskId,
      completed: false,
    });
  }
  await db.insert(subtasks).values(subtaskValues);

  const existingSubtasks = await db.select().from(subtasks).where(eq(subtasks.taskId, taskId));

  const toUpdate = existingSubtasks.map((st, i) => ({
    id: st.id,
    name: `Updated Subtask ${i}`,
    completed: i % 2 === 0
  }));

  console.log(`Running benchmark to update ${SUBTASKS_COUNT} subtasks...`);

  const startCurrent = performance.now();
  // better-sqlite3 transactions shouldn't be async if they return a promise, so we just run updates sequentially
  for (const st of toUpdate) {
    await db.update(subtasks)
      .set({ name: st.name, completed: st.completed })
      .where(eq(subtasks.id, st.id!));
  }
  const endCurrent = performance.now();
  const currentDuration = endCurrent - startCurrent;
  console.log(`Current Implementation (for...of N+1 queries): ${currentDuration.toFixed(2)}ms`);

  // Reset to old values
  for (const st of existingSubtasks) {
    await db.update(subtasks)
      .set({ name: st.name, completed: st.completed })
      .where(eq(subtasks.id, st.id!));
  }

  // --- Optimized implementation using CASE statement ---
  const startOptimized = performance.now();
  const CHUNK_SIZE = 100;
  for (let i = 0; i < toUpdate.length; i += CHUNK_SIZE) {
      const chunk = toUpdate.slice(i, i + CHUNK_SIZE);

      let nameSql = sql`CASE `;
      let completedSql = sql`CASE `;

      for (const st of chunk) {
          nameSql = sql`${nameSql} WHEN ${subtasks.id} = ${st.id} THEN ${st.name} `;
          completedSql = sql`${completedSql} WHEN ${subtasks.id} = ${st.id} THEN ${st.completed ? 1 : 0} `;
      }
      nameSql = sql`${nameSql} ELSE ${subtasks.name} END`;
      completedSql = sql`${completedSql} ELSE ${subtasks.completed} END`;

      await db.update(subtasks)
          .set({
              name: nameSql,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              completed: completedSql as any
          })
          .where(inArray(subtasks.id, chunk.map(c => c.id)));
  }
  const endOptimized = performance.now();
  const optimizedDuration = endOptimized - startOptimized;
  console.log(`Optimized Implementation (Bulk Update with CASE): ${optimizedDuration.toFixed(2)}ms`);

  const improvement = ((currentDuration - optimizedDuration) / currentDuration) * 100;
  console.log(`Improvement: ${improvement.toFixed(2)}%`);

  await db.delete(subtasks).where(eq(subtasks.taskId, taskId));
  await db.delete(tasks).where(eq(tasks.id, taskId));
}

runBenchmark().catch(console.error);
