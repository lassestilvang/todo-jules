import { rateLimit } from '@/lib/rate-limit';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { tasks } from '@/lib/schema';
import { sql } from 'drizzle-orm';
import { attachLabelsToTasks } from '@/lib/task-utils';

export async function GET(request: Request) {
  try {
    // 🛡️ Sentinel: Use the left-most IP to avoid global DoS (all traffic sharing the right-most proxy IP).
    const ip = request.headers.get('x-forwarded-for')?.split(',')?.[0]?.trim() || 'unknown';
    const { success } = rateLimit(`search_get_${ip}`, 100, 60 * 1000);

    if (!success) {
      return NextResponse.json(
        { error: 'Too many requests, please try again later.' },
        { status: 429 }
      );
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');

    if (!query) {
      return NextResponse.json([]);
    }

    // 🛡️ Sentinel: Enforce maximum query length to prevent DoS via large inputs
    if (query.length > 100) {
      return NextResponse.json({ error: 'Query too long' }, { status: 400 });
    }

    // 🛡️ Sentinel: Sanitize user input to prevent FTS5 syntax errors and potential injection
    // Keep only alphanumeric characters and spaces
    const sanitizedQuery = query.replace(/[^\p{L}\p{N}\s]/gu, '').trim();

    if (!sanitizedQuery) {
      return NextResponse.json([]);
    }

    const results = db
      .select()
      .from(tasks)
      .where(sql`id IN (SELECT rowid FROM tasks_fts WHERE tasks_fts MATCH ${'"' + sanitizedQuery + '"*'})`)
      .limit(20)
      .all();

    // Bulk fetch and attach labels to tasks to avoid N+1 queries.
    const tasksWithLabels = attachLabelsToTasks(results);

    return NextResponse.json(tasksWithLabels);
  } catch (error) {
    console.error('Error searching tasks:', error);
    return NextResponse.json({ error: 'Failed to search tasks' }, { status: 500 });
  }
}
