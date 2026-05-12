import { db } from './src/lib/db';
import { tasks } from './src/lib/schema';
import { updateTaskSchema } from './src/lib/validators';

async function run() {
  const taskId = db.select().from(tasks).all()[0].id;

  const validatedData = updateTaskSchema.safeParse({ subtasks: [{ name: 'subtask 1' }] }).data as any;
  const { subtasks, labels, reminders, attachments, ...taskData } = validatedData;

  console.log("taskData", taskData);

  const result = db.update(tasks).set(taskData as Partial<typeof tasks.$inferInsert>).where(require('drizzle-orm').eq(tasks.id, taskId)).returning().all();
  console.log("result", result);
}

run();
