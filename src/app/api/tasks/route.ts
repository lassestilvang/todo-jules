import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import { tasks } from '../../../lib/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const allTasks = await db.select().from(tasks);
    return NextResponse.json(allTasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    await db.insert(tasks).values({
      name: body.name,
      description: body.description,
      date: body.date ? new Date(body.date) : null,
      deadline: body.deadline ? new Date(body.deadline) : null,
      reminders: JSON.stringify(body.reminders),
      estimate: body.estimate,
      actualTime: body.actualTime,
      labels: JSON.stringify(body.labels),
      priority: body.priority,
      subtasks: JSON.stringify(body.subtasks),
      recurring: body.recurring,
      attachment: body.attachment,
      listId: body.listId,
    }).returning();

    return NextResponse.json({ message: 'Task created' }, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}
