'use server';

import { db } from '@/lib/db';
import { tasks } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function reorderTasks(items: { id: number; order: number }[]) {
  try {
    await db.transaction(async (tx) => {
      for (const item of items) {
        await tx
          .update(tasks)
          .set({ order: item.order })
          .where(eq(tasks.id, item.id));
      }
    });
    revalidatePath('/', 'layout');
    return { success: true };
  } catch (error) {
    console.error('Failed to reorder tasks:', error);
    return { success: false, error: 'Failed to reorder tasks' };
  }
}
