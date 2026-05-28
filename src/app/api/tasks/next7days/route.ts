import { rateLimit, getIp } from '@/lib/rate-limit';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { tasks } from '@/lib/schema';
import { and, gte, lt } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const ip = getIp(request);
    const { success } = rateLimit(`tasks_next7days_get_${ip}`, 100, 60 * 1000);

    if (!success) {
      return NextResponse.json(
        { error: 'Too many requests, please try again later.' },
        { status: 429 }
      );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const next7days = new Date(today);
    next7days.setDate(next7days.getDate() + 7);

    // ⚡ Bolt Optimization: Appended `.all()` and removed `await` to execute the query synchronously and eliminate microtask overhead.
    const allTasks = db.select().from(tasks).where(
      and(
        gte(tasks.date, today),
        lt(tasks.date, next7days)
      )
    ).all();
    return NextResponse.json(allTasks);
  } catch (error) {
    console.error('Error fetching tasks for the next 7 days:', error);
    return NextResponse.json({ error: 'Failed to fetch tasks for the next 7 days' }, { status: 500 });
  }
}
