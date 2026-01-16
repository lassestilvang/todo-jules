'use server';

import { db } from '@/lib/db';
import { lists } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function createList(name: string, color: string, emoji: string) {
  try {
    const result = await db.insert(lists).values({
      name,
      color,
      emoji,
    }).returning();

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
