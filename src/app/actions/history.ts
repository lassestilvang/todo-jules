'use server';

import { db } from '@/lib/db';
import { taskHistory } from '@/lib/schema';
import { eq, desc } from 'drizzle-orm';

export async function getTaskHistory(taskId: number) {
  try {
    const history = await db.query.taskHistory.findMany({
      where: eq(taskHistory.taskId, taskId),
      orderBy: [desc(taskHistory.changedAt)],
    });
    return history;
  } catch (error) {
    console.error('Failed to get task history:', error);
    return [];
  }
}
