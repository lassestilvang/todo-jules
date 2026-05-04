import { db } from '@/lib/db';
import { taskLabels, labels, tasks } from '@/lib/schema';
import { eq, inArray } from 'drizzle-orm';

// Helper to reconstruct labels for tasks
export async function attachLabelsToTasks(baseTasks: (typeof tasks.$inferSelect)[]) {
  const taskIds = baseTasks.map(t => t.id);
  const labelsByTaskId: Record<number, { taskId: number; label: typeof labels.$inferSelect }[]> = {};

  if (taskIds.length > 0) {
    const allLabelsData = await db.select({
      taskId: taskLabels.taskId,
      label: labels
    })
    .from(taskLabels)
    .innerJoin(labels, eq(taskLabels.labelId, labels.id))
    .where(inArray(taskLabels.taskId, taskIds))
    .all();

    for (const row of allLabelsData) {
      const taskId = row.taskId!;
      if (!labelsByTaskId[taskId]) {
        labelsByTaskId[taskId] = [];
      }
      labelsByTaskId[taskId].push(row as { taskId: number; label: typeof labels.$inferSelect });
    }
  }

  return baseTasks.map(task => ({
    ...task,
    labels: labelsByTaskId[task.id] || []
  }));
}
