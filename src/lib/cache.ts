import { db } from '@/lib/db';
import { tasks, taskCounts } from '@/lib/schema';
import { count, eq } from 'drizzle-orm';

let cachedTaskCount: number | null = null;
let lastFetch = 0;
const TTL = 10000; // 10 seconds

/**
 * Gets the total task count, using a cached value if it's fresh.
 * Optimized to use task_counts table (O(1)) instead of COUNT(*) (O(N)).
 */
export async function getTaskCount(): Promise<number> {
  const now = Date.now();
  if (cachedTaskCount !== null && (now - lastFetch < TTL)) {
    return cachedTaskCount;
  }

  // Optimization: Try to read from task_counts table first
  try {
    const [countResult] = await db.select().from(taskCounts).where(eq(taskCounts.id, 1));
    if (countResult) {
      cachedTaskCount = countResult.count;
      lastFetch = now;
      return cachedTaskCount;
    }
  } catch (e) {
    // If table doesn't exist or other error, fall back to slow count
    // This ensures robustness even if migrations/triggers failed
    if (process.env.NODE_ENV === 'development') {
      console.warn('Failed to read taskCounts, falling back to slow count', e);
    }
  }

  // Fallback to slow count(*)
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
