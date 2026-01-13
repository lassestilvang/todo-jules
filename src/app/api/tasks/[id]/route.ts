import { NextResponse } from 'next/server';
import { db } from '../../../../lib/db';
import {
  tasks,
  subtasks,
  taskLabels,
  reminders,
  attachments,
} from '../../../../lib/schema';
import { eq, and } from 'drizzle-orm';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const taskId = parseInt(params.id, 10);
    const body = await request.json();

    const updatedTask = await db.transaction(async (tx) => {
      const [updated] = await tx
        .update(tasks)
        .set({
          name: body.name,
          description: body.description,
          date: body.date ? new Date(body.date) : null,
          deadline: body.deadline ? new Date(body.deadline) : null,
          estimate: body.estimate,
          actualTime: body.actualTime,
          priority: body.priority,
          recurring: body.recurring,
          completed: body.completed,
          listId: body.listId,
        })
        .where(eq(tasks.id, taskId))
        .returning();

      // Handle subtasks
      await tx.delete(subtasks).where(eq(subtasks.taskId, taskId));
      if (body.subtasks && body.subtasks.length > 0) {
        await tx.insert(subtasks).values(
          body.subtasks.map((subtask: any) => ({
            ...subtask,
            taskId: taskId,
          }))
        );
      }

      // Handle labels
      await tx.delete(taskLabels).where(eq(taskLabels.taskId, taskId));
      if (body.labels && body.labels.length > 0) {
        await tx.insert(taskLabels).values(
          body.labels.map((labelId: number) => ({
            taskId: taskId,
            labelId,
          }))
        );
      }

      // Handle reminders
      await tx.delete(reminders).where(eq(reminders.taskId, taskId));
      if (body.reminders && body.reminders.length > 0) {
        await tx.insert(reminders).values(
          body.reminders.map((reminder: any) => ({
            ...reminder,
            taskId: taskId,
          }))
        );
      }

      // Handle attachments
      await tx.delete(attachments).where(eq(attachments.taskId, taskId));
      if (body.attachments && body.attachments.length > 0) {
        await tx.insert(attachments).values(
          body.attachments.map((attachment: any) => ({
            ...attachment,
            taskId: taskId,
          }))
        );
      }

      return updated;
    });

    return NextResponse.json(
      { message: 'Task updated', task: updatedTask },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const taskId = parseInt(params.id, 10);
    await db.delete(tasks).where(eq(tasks.id, taskId));

    return NextResponse.json(
      { message: 'Task deleted' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json(
      { error: 'Failed to delete task' },
      { status: 500 }
    );
  }
}
