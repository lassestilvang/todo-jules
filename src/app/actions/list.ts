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
    // ⚡ Bolt Optimization: Use synchronous better-sqlite3 execution
    // Replaced `await db.insert(...).returning()` with `.returning().all()`
    // to eliminate microtask overhead.
    const result = db.insert(lists).values(validation.data).returning().get();

    revalidatePath('/', 'layout');
    return { success: true, data: result };
  } catch (error) {
    console.error('Failed to create list:', error);
    return { success: false, error: 'Failed to create list' };
  }
}

export async function deleteList(id: number) {
  if (typeof id !== 'number' || isNaN(id)) {
    return { success: false, error: 'Invalid List ID' };
  }

  try {
    // ⚡ Bolt Optimization: Use synchronous better-sqlite3 execution
    // Replaced `await db.delete(...)` with `.run()` to eliminate microtask overhead.
    db.delete(lists).where(eq(lists.id, id)).run();
    revalidatePath('/', 'layout');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete list:', error);
    return { success: false, error: 'Failed to delete list' };
  }
}

export async function getLists() {
  try {
    // ⚡ Bolt Optimization: Use synchronous better-sqlite3 execution
    // Replaced `await db.select(...)` with `.all()` to eliminate microtask overhead.
    const allLists = db.select().from(lists).all();
    return allLists;
  } catch (error) {
    console.error('Failed to get lists:', error);
    return [];
  }
}
