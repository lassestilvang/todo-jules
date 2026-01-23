import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { tasks } from '@/lib/schema';
import { like, or } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');

    if (!query) {
      return NextResponse.json([]);
    }

    const results = await db
      .select()
      .from(tasks)
      .where(
        or(
          like(tasks.name, `%${query}%`),
          like(tasks.description, `%${query}%`)
        )
      );

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error searching tasks:', error);
    return NextResponse.json({ error: 'Failed to search tasks' }, { status: 500 });
  }
}
