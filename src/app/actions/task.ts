'use server';

import { db } from '@/lib/db';
import { tasks } from '@/lib/schema';
import { eq, isNull, and, gte, lte, asc, desc, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { after } from 'next/server';
import { logTaskHistory } from '@/lib/history';
import { createTaskSchema, updateTaskSchema } from '@/lib/validators';
import { z } from 'zod';
import { invalidateTaskCountCache } from '@/lib/cache';
import { attachLabelsToTasks } from '@/lib/task-utils';
import { HistoryLog } from '@/lib/history';
import { headers } from 'next/headers';
import { rateLimit, getIpFromHeaders } from '@/lib/rate-limit';

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

let inboxQuery: ReturnType<typeof createInboxQuery> | undefined;
function createInboxQuery() {
  return db.select()
    .from(tasks)
    .where(isNull(tasks.listId))
    .limit(50)
    .orderBy(desc(tasks.createdAt))
    .prepare();
}

export async function getTasksForInbox() {
  const ip = getIpFromHeaders(await headers());
  const { success } = rateLimit(`tasks_inbox_get_${ip}`, 100, 60 * 1000);
  if (!success) throw new Error('Too many requests');

  // ⚡ Bolt Optimization: Lazily initialize prepared statements to eliminate query compilation overhead
  if (!inboxQuery) inboxQuery = createInboxQuery();
  const baseTasks = inboxQuery.all() as (typeof tasks.$inferSelect)[];

  return attachLabelsToTasks(baseTasks);
}

let dateRangeQuery: ReturnType<typeof createDateRangeQuery> | undefined;
function createDateRangeQuery() {
  return db.select()
    .from(tasks)
    .where(and(gte(tasks.date, sql.placeholder('start')), lte(tasks.date, sql.placeholder('end'))))
    .orderBy(asc(tasks.date))
    .limit(50)
    .prepare();
}

export async function getTasksForToday() {
  const ip = getIpFromHeaders(await headers());
  const { success } = rateLimit(`tasks_today_get_${ip}`, 100, 60 * 1000);
  if (!success) throw new Error('Too many requests');

  const { start, end } = getTodayRange();

  // ⚡ Bolt Optimization: Lazily initialize prepared statements to eliminate query compilation overhead
  // Parameters bound via sql.placeholder() for timestamp columns must be explicitly converted from Date objects to numbers.
  if (!dateRangeQuery) dateRangeQuery = createDateRangeQuery();
  const baseTasks = dateRangeQuery.all({ start: start.getTime(), end: end.getTime() }) as (typeof tasks.$inferSelect)[];

  return attachLabelsToTasks(baseTasks);
}

let upcomingQuery: ReturnType<typeof createUpcomingQuery> | undefined;
function createUpcomingQuery() {
  return db.select()
    .from(tasks)
    .where(gte(tasks.date, sql.placeholder('start')))
    .orderBy(asc(tasks.date))
    .limit(50)
    .prepare();
}

export async function getTasksForUpcoming() {
  const ip = getIpFromHeaders(await headers());
  const { success } = rateLimit(`tasks_upcoming_get_${ip}`, 100, 60 * 1000);
  if (!success) throw new Error('Too many requests');

  const { end } = getTodayRange(); // Tasks after today

  // ⚡ Bolt Optimization: Lazily initialize prepared statements to eliminate query compilation overhead
  // Parameters bound via sql.placeholder() for timestamp columns must be explicitly converted from Date objects to numbers.
  if (!upcomingQuery) upcomingQuery = createUpcomingQuery();
  const baseTasks = upcomingQuery.all({ start: end.getTime() }) as (typeof tasks.$inferSelect)[];

  return attachLabelsToTasks(baseTasks);
}

export async function getTasksForNext7Days() {
  const ip = getIpFromHeaders(await headers());
  const { success } = rateLimit(`tasks_next7days_get_${ip}`, 100, 60 * 1000);
  if (!success) throw new Error('Too many requests');

  const { start, end } = getNext7DaysRange();

  // ⚡ Bolt Optimization: Lazily initialize prepared statements to eliminate query compilation overhead
  // Parameters bound via sql.placeholder() for timestamp columns must be explicitly converted from Date objects to numbers.
  if (!dateRangeQuery) dateRangeQuery = createDateRangeQuery();
  const baseTasks = dateRangeQuery.all({ start: start.getTime(), end: end.getTime() }) as (typeof tasks.$inferSelect)[];

  return attachLabelsToTasks(baseTasks);
}

export async function createTask(data: z.input<typeof createTaskSchema>) {
  const ip = getIpFromHeaders(await headers());
  const { success: rateLimitSuccess } = rateLimit(`tasks_post_${ip}`, 100, 60 * 1000);
  if (!rateLimitSuccess) return { success: false, error: 'Too many requests' };

  const validation = createTaskSchema.safeParse(data);
  if (!validation.success) {
      return { success: false, error: validation.error.flatten().fieldErrors };
  }

  try {
    // Extract only the fields belonging to the tasks table to prevent
    // crash or mass assignment vulnerabilities from nested relational data
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { subtasks: payloadSubtasks, labels: payloadLabels, reminders: payloadReminders, attachments: payloadAttachments, ...taskData } = validation.data;

    // ⚡ Bolt Optimization: Use synchronous better-sqlite3 execution
    // Replaced `await db.insert(...).returning()` with `db.insert(...).returning().all()`
    // to eliminate microtask overhead and event loop blocking.
    const newTask = db.insert(tasks).values(taskData).returning().get();
    after(() => {
        logTaskHistory([
          {
            taskId: newTask.id,
            changedField: 'created',
            oldValue: null,
            newValue: 'Task created',
          },
        ]);
    });

    invalidateTaskCountCache();
    revalidatePath('/', 'layout');
    return { success: true, data: newTask };
  } catch (error) {
    console.error('Failed to create task:', error instanceof Error ? error.message : (typeof error === 'string' ? error : 'Unknown error'));
    return { success: false, error: 'Failed to create task' };
  }
}

export async function updateTask(id: number, data: Partial<typeof tasks.$inferInsert>) {
  const ip = getIpFromHeaders(await headers());
  const { success: rateLimitSuccess } = rateLimit(`tasks_put_${ip}`, 100, 60 * 1000);
  if (!rateLimitSuccess) return { success: false, error: 'Too many requests' };

  if (typeof id !== 'number' || isNaN(id)) {
    return { success: false, error: 'Invalid Task ID' };
  }

  const validation = updateTaskSchema.safeParse(data);
  if (!validation.success) {
    return { success: false, error: validation.error.flatten().fieldErrors };
  }

  const validatedData = validation.data;

  try {
    // ⚡ Bolt Optimization: Use core query builder API instead of relational API
    // Replaced await db.query.tasks.findFirst() with await db.select().from(tasks).where().get()
    // to optimize query construction while maintaining driver compatibility.
    const currentTask = await db.select().from(tasks).where(eq(tasks.id, id)).get();

    if (!currentTask) return { success: false, error: 'Task not found' };

    // Extract only the fields belonging to the tasks table to prevent
    // crash or mass assignment vulnerabilities from nested relational data
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { subtasks: payloadSubtasks, labels: payloadLabels, reminders: payloadReminders, attachments: payloadAttachments, ...taskData } = validatedData;

    let updatedTask = currentTask;

    if (Object.keys(taskData).length > 0) {
      // ⚡ Bolt Optimization: Use synchronous better-sqlite3 execution
      // Replaced `await db.update(...).returning()` with `.returning().all()`
      // to eliminate microtask overhead and event loop blocking.
      const result = db.update(tasks).set(taskData as Partial<typeof tasks.$inferInsert>).where(eq(tasks.id, id)).returning().all();
      updatedTask = result[0] ?? currentTask;
    }

    // Log history for changed fields
    const historyLogs: HistoryLog[] = [];
    const keys = Object.keys(validatedData) as (keyof typeof validatedData)[];
    for (const key of keys) {
      const newValue = validatedData[key];
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

    after(() => {
        logTaskHistory(historyLogs);
    });

    revalidatePath('/', 'layout');
    return { success: true, data: updatedTask };
  } catch (error) {
    console.error('Failed to update task:', error instanceof Error ? error.message : 'Unknown error');
    return { success: false, error: 'Failed to update task' };
  }
}

export async function deleteTask(id: number) {
  const ip = getIpFromHeaders(await headers());
  const { success: rateLimitSuccess } = rateLimit(`tasks_delete_${ip}`, 100, 60 * 1000);
  if (!rateLimitSuccess) return { success: false, error: 'Too many requests' };

  if (typeof id !== 'number' || isNaN(id)) {
    return { success: false, error: 'Invalid Task ID' };
  }

  try {
    // ⚡ Bolt Optimization: Use synchronous better-sqlite3 execution
    // Replaced `await db.delete(...)` with `.run()` to eliminate
    // microtask overhead and event loop blocking.
    db.delete(tasks).where(eq(tasks.id, id)).run();
    invalidateTaskCountCache();
    revalidatePath('/', 'layout');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete task:', error instanceof Error ? error.message : 'Unknown error');
    return { success: false, error: 'Failed to delete task' };
  }
}

export async function toggleTaskCompletion(id: number, completed: boolean) {
    const ip = getIpFromHeaders(await headers());
    const { success: rateLimitSuccess } = rateLimit(`tasks_put_${ip}`, 100, 60 * 1000);
    if (!rateLimitSuccess) return { success: false, error: 'Too many requests' };

    if (typeof id !== 'number' || isNaN(id)) {
        return { success: false, error: 'Invalid Task ID' };
    }
    if (typeof completed !== 'boolean') {
        return { success: false, error: 'Invalid completion status' };
    }
    return updateTask(id, { completed });
}
