import React from 'react';
import { db } from '@/lib/db';
import { lists, tasks } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { TaskList } from '@/components/lists/task-list';
import AddTaskForm from '@/components/add-task-form';
import { notFound } from 'next/navigation';
import { attachLabelsToTasks } from '@/lib/task-utils';




export default async function ListPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const listId = parseInt(id, 10);

  if (!/^\d+$/.test(id)) {
    notFound();
  }

  // ⚡ Bolt Optimization: Reduce DB calls on list pages
  // We use a single query with a LEFT JOIN to fetch both the list and its tasks.
  // This eliminates the need for a separate query to fetch the list details.
  const rows = await db.select({
    list: lists,
    task: tasks,
  })
  .from(lists)
  .leftJoin(tasks, eq(tasks.listId, lists.id))
  .where(eq(lists.id, listId))
  .all();

  if (rows.length === 0) {
    notFound();
  }

  const list = rows[0].list;
  const baseTasks = rows
    .filter((row) => row.task !== null)
    .map((row) => row.task!);

  const listTasks = attachLabelsToTasks(baseTasks);

  return (
    <div className="container mx-auto max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-4xl">{list.emoji}</span>
        <h1 className="text-3xl font-bold" style={{ color: list.color }}>{list.name}</h1>
      </div>

      <div className="mb-8">
        <TaskList tasks={listTasks} />
      </div>

      <div className="mt-8 border-t pt-8">
        <h2 className="text-xl font-semibold mb-4">Add New Task to {list.name}</h2>
        <AddTaskForm listId={listId} />
      </div>
    </div>
  );
}
