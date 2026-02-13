'use server';

import { db } from '@/lib/db';
import { tasks } from '@/lib/schema';
import { eq, isNull, and, gte, lte, asc, desc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { logTaskHistory } from '@/lib/history';
import { createTaskSchema } from '@/lib/validators';
import { z } from 'zod';
import { invalidateTaskCountCache } from '@/lib/cache';

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

import { HistoryLog } from '@/lib/history';

export async function createTask(data: z.input<typeof createTaskSchema>) {
  const validation = createTaskSchema.safeParse(data);
  if (!validation.success) {
      return { success: false, error: validation.error.flatten().fieldErrors };
  }

  try {
    const result = await db.insert(tasks).values(validation.data).returning();

    const newTask = result[0];
    await logTaskHistory([
      {
        taskId: newTask.id,
        changedField: 'created',
        oldValue: null,
        newValue: 'Task created',
      },
    ]);

    invalidateTaskCountCache();
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
    const historyLogs: HistoryLog[] = [];
    const keys = Object.keys(data) as (keyof typeof data)[];
    for (const key of keys) {
      const newValue = data[key];
      const oldValue = currentTask[key as keyof typeof currentTask];

      if (newValue !== oldValue) {
        historyLogs.push({
          taskId: id,
          changedField: key,
          oldValue: String(oldValue),
          newValue: String(newValue),
        });
      }
    }

    await logTaskHistory(historyLogs);

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
    invalidateTaskCountCache();
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
