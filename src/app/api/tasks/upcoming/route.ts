import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { tasks } from '@/lib/schema';
import { gte } from 'drizzle-orm';

export async function GET() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // ⚡ Bolt Optimization: Appended `.all()` and removed `await` to execute the query synchronously and eliminate microtask overhead.
    const allTasks = db.select().from(tasks).where(
      gte(tasks.date, today)
    ).all();
    return NextResponse.json(allTasks);
  } catch (error) {
    console.error('Error fetching upcoming tasks:', error);
    return NextResponse.json({ error: 'Failed to fetch upcoming tasks' }, { status: 500 });
  }
}
