import { rateLimit } from '@/lib/rate-limit';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { lists } from '@/lib/schema';

import { createListSchema } from '@/lib/validators';

/**
 * @swagger
 * /api/lists:
 *   post:
 *     summary: Create a new list
 *     description: Creates a new list with the given name, color, and emoji.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateList'
 *     responses:
 *       201:
 *         description: The newly created list.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/List'
 *       400:
 *         description: Bad request.
 *       500:
 *         description: Internal server error.
 */
export async function POST(request: Request) {
  try {
    // Basic rate limit: 100 requests per minute per IP
    // 🛡️ Sentinel: Use the left-most IP to avoid global DoS (all traffic sharing the right-most proxy IP).
    // Note: This relies on the left-most IP which is spoofable.
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const { success } = rateLimit(`lists_post_${ip}`, 100, 60 * 1000);

    if (!success) {
      return NextResponse.json(
        { error: 'Too many requests, please try again later.' },
        { status: 429 }
      );
    }

    // 🛡️ Sentinel: Enforce application/json to prevent CSRF attacks via simple requests
    const contentType = request.headers.get('content-type');
    if (!contentType || contentType.split(';')[0].trim().toLowerCase() !== 'application/json') {
      return NextResponse.json({ error: 'Unsupported Media Type' }, { status: 415 });
    }

    const body = await request.json();
    const validation = createListSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.format() }, { status: 400 });
    }

    const { name, color, emoji } = validation.data;

    // ⚡ Bolt Optimization: Use synchronous better-sqlite3 execution
    // Replaced `await db.insert(...)` with `.all()` to eliminate microtask overhead.
    const [newList] = db
      .insert(lists)
      .values({ name, color, emoji })
      .returning()
      .all();

    return NextResponse.json(newList, { status: 201 });
  } catch (error) {
    console.error('Error creating list:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/lists:
 *   get:
 *     summary: Get all lists
 *     description: Returns a list of all lists.
 *     responses:
 *       200:
 *         description: A list of lists.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/List'
 *       500:
 *         description: Internal server error.
 */
export async function GET() {
  try {
    // ⚡ Bolt Optimization: Use synchronous better-sqlite3 execution
    // Replaced `await db.select(...)` with `.all()` to eliminate microtask overhead.
    const allLists = db.select().from(lists).all();
    return NextResponse.json(allLists);
  } catch (error) {
    console.error('Error fetching lists:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
