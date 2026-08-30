import { db } from '@/lib/db';
import { taskLabels, labels, tasks } from '@/lib/schema';
import { eq, inArray } from 'drizzle-orm';

// ⚡ Bolt Optimization: Module-level fallback empty array
// Why: Prevents creating a new empty array reference on every call for tasks without labels.
// This stabilizes object references for React component props and reduces memory allocation
// and garbage collection overhead during large map operations.
const EMPTY_ARRAY: never[] = [];

// Helper to reconstruct labels for tasks
export function attachLabelsToTasks(baseTasks: (typeof tasks.$inferSelect)[]) {
  if (baseTasks.length === 0) return EMPTY_ARRAY;

  const taskIds = baseTasks.map(t => t.id);
  const labelsByTaskId: Record<number, { taskId: number; label: typeof labels.$inferSelect }[]> = {};

  if (taskIds.length > 0) {
    const allLabelsData = db.select({
      taskId: taskLabels.taskId,
      labelId: taskLabels.labelId,
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
      labelsByTaskId[taskId].push({ taskId, label: row.label });
    }
  }

  return baseTasks.map(task => ({
    ...task,
    labels: labelsByTaskId[task.id] || EMPTY_ARRAY
  }));
}
