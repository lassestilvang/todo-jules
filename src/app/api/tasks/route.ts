import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import {
  tasks,
  subtasks,
  taskLabels,
  reminders,
  attachments,
} from '../../../lib/schema';
import { eq } from 'drizzle-orm';
import { createTaskSchema } from '../../../lib/validators';
import { getTaskCount, invalidateTaskCountCache } from '../../../lib/cache';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    let page = parseInt(searchParams.get('page') || '1');
    let limit = parseInt(searchParams.get('limit') || '20');

    // Validate and sanitize parameters
    if (isNaN(page) || page < 1) page = 1;
    if (isNaN(limit) || limit < 1) limit = 20;
    if (limit > 100) limit = 100; // Cap limit for safety

    const offset = (page - 1) * limit;

    const total = await getTaskCount();

    const allTasks = await db.query.tasks.findMany({
      limit: limit,
      offset: offset,
      with: {
        subtasks: true,
        labels: {
          with: {
            label: true,
          },
        },
        reminders: true,
        attachments: true,
      },
    });

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
    const validatedBody = createTaskSchema.parse(body);

    const createdTask = await db.transaction(async (tx) => {
      const [newTask] = await tx
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
        .returning();

      if (validatedBody.subtasks && validatedBody.subtasks.length > 0) {
        await tx.insert(subtasks).values(
          validatedBody.subtasks.map((subtask) => ({
            ...subtask,
            taskId: newTask.id,
          }))
        );
      }

      if (validatedBody.labels && validatedBody.labels.length > 0) {
        await tx.insert(taskLabels).values(
          validatedBody.labels.map((labelId) => ({
            taskId: newTask.id,
            labelId,
          }))
        );
      }

      if (validatedBody.reminders && validatedBody.reminders.length > 0) {
        await tx.insert(reminders).values(
          validatedBody.reminders.map((reminder) => ({
            ...reminder,
            taskId: newTask.id,
          }))
        );
      }

      if (validatedBody.attachments && validatedBody.attachments.length > 0) {
        await tx.insert(attachments).values(
          validatedBody.attachments.map((attachment) => ({
            ...attachment,
            taskId: newTask.id,
          }))
        );
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
