import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { tasks } from '@/lib/schema';
import { sql } from 'drizzle-orm';
import { attachLabelsToTasks } from '@/lib/task-utils';

export async function GET(request: Request) {
  try {
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

    // ⚡ Bolt Optimization: Use `attachLabelsToTasks` for bulk lookup
    // Prevents N+1 query problem by extracting all task IDs and fetching
    // related task labels in a single bulk query with O(n) memory mapping
    // instead of initiating an individual DB query per task result.
    const tasksWithLabels = attachLabelsToTasks(results);

    return NextResponse.json(tasksWithLabels);
  } catch (error) {
    console.error('Error searching tasks:', error);
    return NextResponse.json({ error: 'Failed to search tasks' }, { status: 500 });
  }
}
