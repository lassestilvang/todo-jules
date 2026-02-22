'use server';

import { db } from '@/lib/db';
import { tasks } from '@/lib/schema';
import { eq, sql, inArray } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function reorderTasks(items: { id: number; order: number }[]) {
  try {
    if (items.length === 0) return { success: true };

    // SQLite has a limit on variables (default 999 or 32766).
    // Each item uses 2 variables in CASE (id, order) and 1 in WHERE IN (id).
    // Total 3 * N variables.
    // 200 items * 3 = 600 variables, which is safe for the lower bound 999 limit.
    const CHUNK_SIZE = 200;

    await db.transaction(async (tx) => {
      for (let i = 0; i < items.length; i += CHUNK_SIZE) {
        const chunk = items.slice(i, i + CHUNK_SIZE);

        const sqlChunks: any[] = [];
        const ids: number[] = [];

        for (const item of chunk) {
          sqlChunks.push(sql`when ${item.id} then ${item.order}`);
          ids.push(item.id);
        }

        const caseStatement = sql`case ${tasks.id} ${sql.join(sqlChunks, sql` `)} end`;

        await tx
          .update(tasks)
          .set({ order: caseStatement })
          .where(inArray(tasks.id, ids))
          .run();
      }
    });

    revalidatePath('/', 'layout');
    return { success: true };
  } catch (error) {
    console.error('Failed to reorder tasks:', error);
    return { success: false, error: 'Failed to reorder tasks' };
  }
}
