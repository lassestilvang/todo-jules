import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
  tasks,
  subtasks,
  taskLabels,
  reminders,
  attachments,
} from '@/lib/schema';
import { eq, inArray, notInArray, sql, and } from 'drizzle-orm';
import { updateTaskSchema } from '@/lib/validators';
import { invalidateTaskCountCache } from '@/lib/cache';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const taskId = parseInt(id, 10);
    const body = await request.json();
    const validatedBody = updateTaskSchema.parse(body);

    const updatedTask = await db.transaction(async (tx) => {
      if (Object.keys(validatedBody).length > 0) {
        await tx
          .update(tasks)
          .set({
            ...validatedBody,
            date: validatedBody.date ? new Date(validatedBody.date) : undefined,
            deadline: validatedBody.deadline
              ? new Date(validatedBody.deadline)
              : undefined,
          })
          .where(eq(tasks.id, taskId));
      }

      const [updated] = await tx
        .select()
        .from(tasks)
        .where(eq(tasks.id, taskId));

      // Handle subtasks
      if (validatedBody.subtasks) {
        const incomingIds = validatedBody.subtasks
          .map((st) => st.id)
          .filter((id) => id !== undefined) as number[];

        if (incomingIds.length > 0) {
          await tx.delete(subtasks).where(
            and(
              eq(subtasks.taskId, taskId),
              notInArray(subtasks.id, incomingIds)
            )
          );
        } else {
          await tx.delete(subtasks).where(eq(subtasks.taskId, taskId));
        }

        const toInsert = validatedBody.subtasks
          .filter((st) => st.id === undefined)
          .map((st) => ({
            name: st.name,
            completed: st.completed,
            taskId: taskId,
          }));

        const toUpdate = validatedBody.subtasks.filter((st) => st.id !== undefined);

        if (toInsert.length > 0) {
          await tx.insert(subtasks).values(toInsert);
        }
        if (toUpdate.length > 0) {
          const CHUNK_SIZE = 100;
          for (let i = 0; i < toUpdate.length; i += CHUNK_SIZE) {
            const chunk = toUpdate.slice(i, i + CHUNK_SIZE);

            const nameChunks: import('drizzle-orm').SQL[] = [];
            const completedChunks: import('drizzle-orm').SQL[] = [];
            const ids: number[] = [];

            for (const item of chunk) {
              nameChunks.push(sql`when ${item.id} then ${item.name}`);
              completedChunks.push(sql`when ${item.id} then ${item.completed ? 1 : 0}`);
              ids.push(item.id!);
            }

            const nameCaseStatement = sql`case ${subtasks.id} ${sql.join(nameChunks, sql` `)} else ${subtasks.name} end`;
            const completedCaseStatement = sql`case ${subtasks.id} ${sql.join(completedChunks, sql` `)} else ${subtasks.completed} end`;

            await tx
              .update(subtasks)
              .set({
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                name: nameCaseStatement as any,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                completed: completedCaseStatement as any,
              })
              .where(inArray(subtasks.id, ids));
          }
        }
      }

      // Handle labels
      if (validatedBody.labels) {
        await tx.delete(taskLabels).where(eq(taskLabels.taskId, taskId));
        if (validatedBody.labels.length > 0) {
          await tx.insert(taskLabels).values(
            validatedBody.labels.map((labelId) => ({
              taskId: taskId,
              labelId,
            }))
          );
        }
      }

      // Handle reminders
      if (validatedBody.reminders) {
        await tx.delete(reminders).where(eq(reminders.taskId, taskId));
        if (validatedBody.reminders.length > 0) {
          await tx.insert(reminders).values(
            validatedBody.reminders.map((reminder) => ({
              ...reminder,
              taskId: taskId,
            }))
          );
        }
      }

      // Handle attachments
      if (validatedBody.attachments) {
        await tx.delete(attachments).where(eq(attachments.taskId, taskId));
        if (validatedBody.attachments.length > 0) {
          await tx.insert(attachments).values(
            validatedBody.attachments.map((attachment) => ({
              ...attachment,
              taskId: taskId,
            }))
          );
        }
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const taskId = parseInt(id, 10);
    await db.delete(tasks).where(eq(tasks.id, taskId));

    invalidateTaskCountCache();

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
