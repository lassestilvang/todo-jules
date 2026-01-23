import { db } from './db';
import { taskHistory } from './schema';

export type HistoryLog = Omit<typeof taskHistory.$inferInsert, 'id' | 'changedAt'>;

export async function logTaskHistory(logs: HistoryLog[]) {
  if (logs.length === 0) {
    return;
  }

  try {
    await db.insert(taskHistory).values(logs);
  } catch (error) {
    console.error('Failed to log task history:', error);
    // We don't want to fail the main action if logging fails, but we should know about it
  }
}
