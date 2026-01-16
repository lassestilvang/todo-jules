'use server';

import { db } from '@/lib/db';
import { lists } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { createListSchema } from '@/lib/validators';

export async function createList(name: string, color: string, emoji: string) {
  const validation = createListSchema.safeParse({ name, color, emoji });

  if (!validation.success) {
      return { success: false, error: 'Validation failed' };
  }

  try {
    const result = await db.insert(lists).values(validation.data).returning();

    revalidatePath('/', 'layout');
    return { success: true, data: result[0] };
  } catch (error) {
    console.error('Failed to create list:', error);
    return { success: false, error: 'Failed to create list' };
  }
}

export async function deleteList(id: number) {
  try {
    await db.delete(lists).where(eq(lists.id, id));
    revalidatePath('/', 'layout');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete list:', error);
    return { success: false, error: 'Failed to delete list' };
  }
}

export async function getLists() {
  try {
    const allLists = await db.select().from(lists);
    return allLists;
  } catch (error) {
    console.error('Failed to get lists:', error);
    return [];
  }
}
