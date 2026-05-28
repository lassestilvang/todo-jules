import { rateLimit, getIp } from '@/lib/rate-limit';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { tasks } from '@/lib/schema';
import { eq, and, gte, lt } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const ip = getIp(request);
    const { success } = rateLimit(`tasks_today_get_${ip}`, 100, 60 * 1000);

    if (!success) {
      return NextResponse.json(
        { error: 'Too many requests, please try again later.' },
        { status: 429 }
      );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // ⚡ Bolt Optimization: Appended `.all()` and removed `await` to execute the query synchronously and eliminate microtask overhead.
    const allTasks = db.select().from(tasks).where(
      and(
        gte(tasks.date, today),
        lt(tasks.date, tomorrow)
      )
    ).all();
    return NextResponse.json(allTasks);
  } catch (error) {
    console.error('Error fetching tasks for today:', error);
    return NextResponse.json({ error: 'Failed to fetch tasks for today' }, { status: 500 });
  }
}
