'use server';

import { db } from '@/lib/db';
import { tasks, taskLabels, labels, reminders, attachments, subtasks } from '@/lib/schema';
import { eq, isNull, and, gte, lte, asc, desc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { logTaskHistory } from '@/lib/history';

// Helper to get today's start and end timestamps
const getTodayRange = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  return { start, end };
};

const getNext7DaysRange = () => {
  const { start } = getTodayRange();
  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

export async function getTasksForInbox() {
  return await db.query.tasks.findMany({
    where: isNull(tasks.listId),
    with: {
      subtasks: true,
      labels: {
        with: {
          label: true
        }
      },
      reminders: true,
      attachments: true,
    },
    orderBy: [desc(tasks.createdAt)],
  });
}

export async function getTasksForToday() {
  const { start, end } = getTodayRange();
  return await db.query.tasks.findMany({
    where: and(gte(tasks.date, start), lte(tasks.date, end)),
    with: {
      subtasks: true,
      labels: {
        with: {
          label: true
        }
      },
      reminders: true,
      attachments: true,
    },
    orderBy: [asc(tasks.date)],
  });
}

export async function getTasksForUpcoming() {
  const { end } = getTodayRange(); // Tasks after today
  return await db.query.tasks.findMany({
    where: gte(tasks.date, end),
    with: {
      subtasks: true,
      labels: {
        with: {
          label: true
        }
      },
      reminders: true,
      attachments: true,
    },
    orderBy: [asc(tasks.date)],
  });
}

export async function getTasksForNext7Days() {
  const { start, end } = getNext7DaysRange();
  return await db.query.tasks.findMany({
    where: and(gte(tasks.date, start), lte(tasks.date, end)),
    with: {
      subtasks: true,
      labels: {
        with: {
          label: true
        }
      },
      reminders: true,
      attachments: true,
    },
    orderBy: [asc(tasks.date)],
  });
}

export async function createTask(data: {
  name: string;
  description?: string;
  date?: Date;
  listId?: number;
  priority?: string;
}) {
  try {
    const result = await db.insert(tasks).values({
      name: data.name,
      description: data.description,
      date: data.date,
      listId: data.listId,
      priority: data.priority,
    }).returning();

    const newTask = result[0];
    await logTaskHistory(newTask.id, 'created', null, 'Task created');

    revalidatePath('/', 'layout');
    return { success: true, data: newTask };
  } catch (error) {
    console.error('Failed to create task:', error);
    return { success: false, error: 'Failed to create task' };
  }
}

export async function updateTask(id: number, data: Partial<typeof tasks.$inferInsert>) {
  try {
    const currentTask = await db.query.tasks.findFirst({
      where: eq(tasks.id, id),
    });

    if (!currentTask) return { success: false, error: 'Task not found' };

    const result = await db.update(tasks).set(data).where(eq(tasks.id, id)).returning();
    const updatedTask = result[0];

    // Log history for changed fields
    for (const key in data) {
      const k = key as keyof typeof data;
      // @ts-ignore
      if (data[k] !== currentTask[k]) {
        // @ts-ignore
        await logTaskHistory(id, key, String(currentTask[k]), String(data[k]));
      }
    }

    revalidatePath('/', 'layout');
    return { success: true, data: updatedTask };
  } catch (error) {
    console.error('Failed to update task:', error);
    return { success: false, error: 'Failed to update task' };
  }
}

export async function deleteTask(id: number) {
  try {
    await db.delete(tasks).where(eq(tasks.id, id));
    revalidatePath('/', 'layout');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete task:', error);
    return { success: false, error: 'Failed to delete task' };
  }
}

export async function toggleTaskCompletion(id: number, completed: boolean) {
    return updateTask(id, { completed });
}
