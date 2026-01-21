import React from 'react';
import { db } from '@/lib/db';
import { lists, tasks } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { TaskList } from '@/components/lists/task-list';
import AddTaskForm from '@/components/add-task-form';
import { notFound } from 'next/navigation';

export default async function ListPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const listId = parseInt(id);

  if (isNaN(listId)) {
    notFound();
  }

  const list = await db.query.lists.findFirst({
    where: eq(lists.id, listId),
  });

  if (!list) {
    notFound();
  }

  const listTasks = await db.query.tasks.findMany({
    where: eq(tasks.listId, listId),
    with: {
      subtasks: true,
      labels: {
        with: {
          label: true
        }
      },
      reminders: true,
      attachments: true,
    },
  });

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
