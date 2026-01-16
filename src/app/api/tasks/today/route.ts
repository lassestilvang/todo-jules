import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { tasks } from '@/lib/schema';
import { eq, and, gte, lt } from 'drizzle-orm';

export async function GET() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const allTasks = await db.select().from(tasks).where(
      and(
        gte(tasks.date, today),
        lt(tasks.date, tomorrow)
      )
    );
    return NextResponse.json(allTasks);
  } catch (error) {
    console.error('Error fetching tasks for today:', error);
    return NextResponse.json({ error: 'Failed to fetch tasks for today' }, { status: 500 });
  }
}
