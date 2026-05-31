'use server';

import { db } from '@/lib/db';
import { taskHistory } from '@/lib/schema';
import { eq, desc } from 'drizzle-orm';
import { headers } from 'next/headers';
import { rateLimit, getIpFromHeaders } from '@/lib/rate-limit';

export async function getTaskHistory(taskId: number) {
  const ip = getIpFromHeaders(await headers());
  const { success } = rateLimit(`history_get_${ip}`, 100, 60 * 1000);
  if (!success) return [];

  if (typeof taskId !== 'number' || isNaN(taskId)) {
    return [];
  }

  try {
    const history = db.select()
      .from(taskHistory)
      .where(eq(taskHistory.taskId, taskId))
      .orderBy(desc(taskHistory.changedAt))
      .all();
    return history;
  } catch (error) {
    console.error('Failed to get task history:', error instanceof Error ? error.message : 'Unknown error');
    return [];
  }
}
