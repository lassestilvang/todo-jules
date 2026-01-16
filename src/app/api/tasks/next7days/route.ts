import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { tasks } from '@/lib/schema';
import { and, gte, lt } from 'drizzle-orm';

export async function GET() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const next7days = new Date(today);
    next7days.setDate(next7days.getDate() + 7);

    const allTasks = await db.select().from(tasks).where(
      and(
        gte(tasks.date, today),
        lt(tasks.date, next7days)
      )
    );
    return NextResponse.json(allTasks);
  } catch (error) {
    console.error('Error fetching tasks for the next 7 days:', error);
    return NextResponse.json({ error: 'Failed to fetch tasks for the next 7 days' }, { status: 500 });
  }
}
