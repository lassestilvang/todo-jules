import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import { tasks } from '../../../lib/schema';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    await db.insert(tasks).values({
      name: body.name,
      listId: body.listId,
    }).returning();
    
    return NextResponse.json({ message: 'Task created' }, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}
