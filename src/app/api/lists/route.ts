import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import { lists } from '../../../lib/schema';

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
