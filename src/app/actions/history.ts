'use server';

import { db } from '@/lib/db';
import { taskHistory } from '@/lib/schema';
import { eq, desc } from 'drizzle-orm';

export async function getTaskHistory(taskId: number) {
  if (typeof taskId !== 'number' || isNaN(taskId)) {
    return [];
  }

  try {
    const history = await db.select()
      .from(taskHistory)
      .where(eq(taskHistory.taskId, taskId))
      .orderBy(desc(taskHistory.changedAt))
      .all();
    return history;
  } catch (error) {
    console.error('Failed to get task history:', error);
    return [];
  }
}
