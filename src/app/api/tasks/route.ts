import { rateLimit } from '@/lib/rate-limit';
import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import {
  tasks,
  subtasks,

  taskLabels,
  reminders,
  attachments,
} from '../../../lib/schema';


import { createTaskSchema } from '../../../lib/validators';
import { getTaskCount, invalidateTaskCountCache } from '../../../lib/cache';
import { attachLabelsToTasks } from '../../../lib/task-utils';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const pageParam = searchParams.get('page') || '1';
    const limitParam = searchParams.get('limit') || '20';
    let page = parseInt(pageParam, 10);
    let limit = parseInt(limitParam, 10);

    // Validate and sanitize parameters strictly
    if (isNaN(page) || String(page) !== pageParam || page < 1) page = 1;
    if (isNaN(limit) || String(limit) !== limitParam || limit < 1) limit = 20;
    if (limit > 100) limit = 100; // Cap limit for safety

    const offset = (page - 1) * limit;

    const total = getTaskCount();

    // ⚡ Bolt Optimization: Use synchronous better-sqlite3 execution
    // Replaced `await db.query.tasks.findMany()` with `db.select().from(tasks).limit().offset().all()`
    // to eliminate microtask overhead caused by relational queries in Drizzle.
    const baseTasks = db.select()
      .from(tasks)
      .limit(limit)
      .offset(offset)
      .all();

    const allTasks = attachLabelsToTasks(baseTasks);

    return NextResponse.json({
      data: allTasks,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Basic rate limit: 100 requests per minute per IP
    // 🛡️ Sentinel: Use the left-most IP to avoid global DoS (all traffic sharing the right-most proxy IP).
    // Note: This relies on the left-most IP which is spoofable.
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const { success } = rateLimit(`tasks_post_${ip}`, 100, 60 * 1000);

    if (!success) {
      return NextResponse.json(
        { error: 'Too many requests, please try again later.' },
        { status: 429 }
      );
    }

    // 🛡️ Sentinel: Enforce application/json to prevent CSRF attacks via simple requests
    const contentType = request.headers.get('content-type');
    if (!contentType || !/^application\/json(;.*)?$/i.test(contentType.trim())) {
      return NextResponse.json({ error: 'Unsupported Media Type' }, { status: 415 });
    }

    const body = await request.json();
    const validation = createTaskSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.format() }, { status: 400 });
    }

    const validatedBody = validation.data;

    // better-sqlite3 requires synchronous transactions.
    const createdTask = db.transaction((tx) => {
      // Drizzle with better-sqlite3 returns results synchronously.
      // Cast the result to any to bypass TS error if inferred type is wrong
      // or explicit type the return.
      const result = tx
        .insert(tasks)
        .values({
          name: validatedBody.name,
          description: validatedBody.description,
          date: validatedBody.date ? new Date(validatedBody.date) : null,
          deadline: validatedBody.deadline ? new Date(validatedBody.deadline) : null,
          estimate: validatedBody.estimate,
          actualTime: validatedBody.actualTime,
          priority: validatedBody.priority,
          recurring: validatedBody.recurring,
          listId: validatedBody.listId,
        })
        .returning().all() as unknown as (typeof tasks.$inferSelect)[];

      const newTask = result[0];

      // Execute dependent inserts sequentially (better-sqlite3 transactions are synchronous)


      if (validatedBody.subtasks && validatedBody.subtasks.length > 0) {
        tx.insert(subtasks).values(
            validatedBody.subtasks.map((subtask) => ({
              ...subtask,
              taskId: newTask.id,
            }))
          ).run();
      }

      if (validatedBody.labels && validatedBody.labels.length > 0) {
        tx.insert(taskLabels).values(
            validatedBody.labels.map((labelId) => ({
              taskId: newTask.id,
              labelId,
            }))
          ).run();
      }

      if (validatedBody.reminders && validatedBody.reminders.length > 0) {
        tx.insert(reminders).values(
            validatedBody.reminders.map((reminder) => ({
              ...reminder,
              taskId: newTask.id,
            }))
          ).run();
      }

      if (validatedBody.attachments && validatedBody.attachments.length > 0) {
        tx.insert(attachments).values(
            validatedBody.attachments.map((attachment) => ({
              ...attachment,
              taskId: newTask.id,
            }))
          ).run();
      }



      return newTask;
    });

    invalidateTaskCountCache();

    return NextResponse.json(
      { message: 'Task created', task: createdTask },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    );
  }
}
