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

export async function GET() {
  try {
    const allTasks = await db.query.tasks.findMany({
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

    const createdTask = await db.transaction(async (tx) => {
      const [newTask] = await tx
        .insert(tasks)
        .values({
          name: body.name,
          description: body.description,
          date: body.date ? new Date(body.date) : null,
          deadline: body.deadline ? new Date(body.deadline) : null,
          estimate: body.estimate,
          actualTime: body.actualTime,
          priority: body.priority,
          recurring: body.recurring,
          listId: body.listId,
        })
        .returning();

      if (body.subtasks && body.subtasks.length > 0) {
        await tx.insert(subtasks).values(
          body.subtasks.map((subtask: any) => ({
            ...subtask,
            taskId: newTask.id,
          }))
        );
      }

      if (body.labels && body.labels.length > 0) {
        await tx.insert(taskLabels).values(
          body.labels.map((labelId: number) => ({
            taskId: newTask.id,
            labelId,
          }))
        );
      }

      if (body.reminders && body.reminders.length > 0) {
        await tx.insert(reminders).values(
          body.reminders.map((reminder: any) => ({
            ...reminder,
            taskId: newTask.id,
          }))
        );
      }

      if (body.attachments && body.attachments.length > 0) {
        await tx.insert(attachments).values(
          body.attachments.map((attachment: any) => ({
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
