import { db } from './db';
import { taskHistory } from './schema';

export async function logTaskHistory(
  taskId: number,
  changedField: string,
  oldValue: string | null | undefined,
  newValue: string | null | undefined
) {
  try {
    await db.insert(taskHistory).values({
      taskId,
      changedField,
      oldValue: oldValue ? String(oldValue) : null,
      newValue: newValue ? String(newValue) : null,
    });
  } catch (error) {
    console.error('Failed to log task history:', error);
    // We don't want to fail the main action if logging fails, but we should know about it
  }
}
