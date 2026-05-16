import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { lists } from '@/lib/schema';
import { eq } from 'drizzle-orm';

import { updateListSchema } from '@/lib/validators';

/**
 * @swagger
 * /api/lists/{id}:
 *   put:
 *     summary: Update a list
 *     description: Updates a list with the given name, color, and emoji.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the list to update.
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateList'
 *     responses:
 *       200:
 *         description: The updated list.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/List'
 *       400:
 *         description: Bad request.
 *       404:
 *         description: List not found.
 *       500:
 *         description: Internal server error.
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idString } = await params;
    const id = parseInt(idString, 10);
    if (!/^\d+$/.test(idString)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    // 🛡️ Sentinel: Enforce application/json to prevent CSRF attacks via simple requests
    const contentType = request.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return NextResponse.json({ error: 'Unsupported Media Type' }, { status: 415 });
    }

    const body = await request.json();
    const validation = updateListSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.format() }, { status: 400 });
    }

    const { name, color, emoji } = validation.data;

    // 🛡️ Sentinel: Prevent "No values to set" error
    const updateData = Object.fromEntries(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      Object.entries({ name, color, emoji }).filter(([_, v]) => v !== undefined)
    );

    if (Object.keys(updateData).length === 0) {
      const existingList = db.select().from(lists).where(eq(lists.id, id)).get();
      if (!existingList) {
        return NextResponse.json({ error: 'List not found' }, { status: 404 });
      }
      return NextResponse.json(existingList);
    }

    // ⚡ Bolt Optimization: Use synchronous better-sqlite3 execution
    // Replaced `await db.update(...)` with `.all()` to eliminate microtask overhead.
    const [updatedList] = db
      .update(lists)
      .set(updateData)
      .where(eq(lists.id, id))
      .returning()
      .all();

    if (!updatedList) {
      return NextResponse.json({ error: 'List not found' }, { status: 404 });
    }

    return NextResponse.json(updatedList);
  } catch (error) {
    console.error('Error updating list:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/lists/{id}:
 *   delete:
 *     summary: Delete a list
 *     description: Deletes a list by its ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the list to delete.
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: The list was deleted successfully.
 *       400:
 *         description: Bad request.
 *       404:
 *         description: List not found.
 *       500:
 *         description: Internal server error.
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idString } = await params;
    const id = parseInt(idString, 10);
    if (!/^\d+$/.test(idString)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    // ⚡ Bolt Optimization: Use synchronous better-sqlite3 execution
    // Replaced `await db.delete(...)` with `.all()` to eliminate microtask overhead.
    const deletedList = db.delete(lists).where(eq(lists.id, id)).returning().get();

    if (!deletedList) {
        return NextResponse.json({ error: 'List not found' }, { status: 404 });
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting list:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
