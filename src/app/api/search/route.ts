import { NextResponse } from 'next/server';
import { db } from '../../../../lib/db';
import { tasks } from '../../../../lib/schema';
import Fuse from 'fuse.js';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');

    if (!query) {
      return NextResponse.json([]);
    }

    const allTasks = await db.select().from(tasks);

    const fuse = new Fuse(allTasks, {
      keys: ['name', 'description'],
      threshold: 0.3,
    });

    const results = fuse.search(query);

    return NextResponse.json(results.map((result) => result.item));
  } catch (error) {
    console.error('Error searching tasks:', error);
    return NextResponse.json({ error: 'Failed to search tasks' }, { status: 500 });
  }
}
