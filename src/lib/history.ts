import { db } from './db';
import { taskHistory } from './schema';

export type HistoryLog = Omit<typeof taskHistory.$inferInsert, 'id' | 'changedAt'>;

export function logTaskHistory(logs: HistoryLog[]) {
  if (logs.length === 0) {
    return;
  }

  try {
    db.insert(taskHistory).values(logs).run();
  } catch (error) {
    console.error('Failed to log task history:', error instanceof Error ? error.message : 'Unknown error');
    // We don't want to fail the main action if logging fails, but we should know about it
  }
}
