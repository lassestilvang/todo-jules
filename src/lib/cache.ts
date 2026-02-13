import { db } from '@/lib/db';
import { tasks } from '@/lib/schema';
import { count } from 'drizzle-orm';

let cachedTaskCount: number | null = null;
let lastFetch = 0;
const TTL = 10000; // 10 seconds

/**
 * Gets the total task count, using a cached value if it's fresh.
 * This optimizes the O(N) count(*) query for large datasets.
 */
export async function getTaskCount(): Promise<number> {
  const now = Date.now();
  if (cachedTaskCount !== null && (now - lastFetch < TTL)) {
    return cachedTaskCount;
  }

  const [totalResult] = await db.select({ count: count() }).from(tasks);
  cachedTaskCount = totalResult.count;
  lastFetch = now;
  return cachedTaskCount;
}

/**
 * Invalidates the task count cache.
 * Should be called whenever a task is created or deleted.
 */
export function invalidateTaskCountCache(): void {
  cachedTaskCount = null;
}
