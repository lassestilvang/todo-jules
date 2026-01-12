import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import { lists } from '../../../lib/schema';

export async function GET() {
  try {
    const allLists = await db.select().from(lists);
    return NextResponse.json(allLists);
  } catch (error) {
    console.error('Error fetching lists:', error);
    return NextResponse.json({ error: 'Failed to fetch lists' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    await db.insert(lists).values({
      name: body.name,
      color: body.color,
      emoji: body.emoji,
    }).returning();

    return NextResponse.json({ message: 'List created' }, { status: 201 });
  } catch (error) {
    console.error('Error creating list:', error);
    return NextResponse.json({ error: 'Failed to create list' }, { status: 500 });
  }
}
