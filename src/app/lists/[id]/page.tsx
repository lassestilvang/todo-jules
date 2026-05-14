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

  const list = await db.query.lists.findFirst({
    where: eq(lists.id, listId),
  });

  if (!list) {
    notFound();
  }

  // ⚡ Bolt Optimization: Prune unused relations (subtasks, reminders, attachments)
  // from Drizzle fetch on list pages since the TaskList and TaskComponent
  // UI does not render them.
  // Impact: Removes expensive LEFT JOINs from the SQLite query layer,
  // reducing execution time and data payload size.
  const baseTasks = db.select()
    .from(tasks)
    .where(eq(tasks.listId, listId))
    .all();

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
