import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import {
  tasks,
  subtasks,
  labels,
  taskLabels,
  reminders,
  attachments,
} from '../../../lib/schema';
import { eq, inArray } from 'drizzle-orm';

import { createTaskSchema } from '../../../lib/validators';
import { getTaskCount, invalidateTaskCountCache } from '../../../lib/cache';

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

    // ⚡ Bolt Optimization: Replace Promise.all with sequential awaits
    // better-sqlite3 is inherently synchronous and blocks the event loop.
    // Using Promise.all here does not provide parallel execution but adds
    // microtask overhead and array allocation.
    // ⚡ Bolt Optimization: Avoid using relational queries (findMany) with better-sqlite3
    // because they introduce promise microtask overhead. Instead, use the core Query Builder
    // API with `.all()` for synchronous, non-blocking execution which is faster.
    const total = getTaskCount();

    const baseTasks = db.select()
        .from(tasks)
        .limit(limit)
        .offset(offset)
        .all();

    // ⚡ Bolt Optimization: Fix N+1 Query Problem
    // Instead of querying labels inside a map loop (which causes an N+1 performance bottleneck),
    // we fetch all related labels in a single bulk query using `inArray`, and group them
    // in memory using an O(n) hash map lookup.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let allTasks = baseTasks.map(task => ({ ...task, labels: [] as any[] }));
    if (baseTasks.length > 0) {
      const taskIds = baseTasks.map(t => t.id);

      const allLabels = db.select({
        taskId: taskLabels.taskId,
        label: labels
      })
      .from(taskLabels)
      .innerJoin(labels, eq(taskLabels.labelId, labels.id))
      .where(inArray(taskLabels.taskId, taskIds))
      .all();

      const labelsByTaskId = allLabels.reduce((acc, row) => {
        if (!acc[row.taskId!]) {
          acc[row.taskId!] = [];
        }
        acc[row.taskId!].push({ label: row.label });
        return acc;
      }, {} as Record<number, { label: typeof labels.$inferSelect }[]>);

      allTasks = baseTasks.map(task => ({
        ...task,
        labels: labelsByTaskId[task.id] || []
      }));
    }

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
