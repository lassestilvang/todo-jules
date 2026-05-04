import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { tasks } from '@/lib/schema';
import { sql } from 'drizzle-orm';

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
    const sanitizedQuery = query.replace(/[^a-zA-Z0-9\s]/g, '').trim();

    if (!sanitizedQuery) {
      return NextResponse.json([]);
    }

    const results = await db
      .select()
      .from(tasks)
      .where(sql`id IN (SELECT rowid FROM tasks_fts WHERE tasks_fts MATCH ${'"' + sanitizedQuery + '"*'})`)
      .limit(20);

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error searching tasks:', error);
    return NextResponse.json({ error: 'Failed to search tasks' }, { status: 500 });
  }
}
