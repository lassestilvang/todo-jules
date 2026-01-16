import React from 'react';
import { getTasksForInbox } from '@/app/actions/task';
import { TaskList } from '@/components/lists/task-list';
import AddTaskForm from '@/components/add-task-form';
import { Task } from '@/lib/types';

export default async function InboxPage() {
  // @ts-ignore
  const tasks = await getTasksForInbox();

  return (
    <div className="container mx-auto max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Inbox</h1>

      <div className="mb-8">
        {/* @ts-ignore */}
        <TaskList tasks={tasks} />
      </div>

      <div className="mt-8 border-t pt-8">
        <h2 className="text-xl font-semibold mb-4">Add New Task</h2>
        <AddTaskForm />
      </div>
    </div>
  );
}
