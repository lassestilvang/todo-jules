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

export async function GET() {
  try {
    const allTasks = await db.query.tasks.findMany({
      with: {
        subtasks: true,
        taskLabels: {
          with: {
            label: true,
          },
        },
        reminders: true,
        attachments: true,
      },
    });
    return NextResponse.json(allTasks);
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
