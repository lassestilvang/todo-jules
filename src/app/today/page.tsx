import React from 'react';
import { getTasksForToday } from '@/app/actions/task';
import { TaskList } from '@/components/lists/task-list';
import AddTaskForm from '@/components/add-task-form';

export default async function TodayPage() {
  const tasks = await getTasksForToday();

  return (
    <div className="container mx-auto max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Today</h1>

      <div className="mb-8">
        <TaskList tasks={tasks} />
      </div>

      <div className="mt-8 border-t pt-8">
        <h2 className="text-xl font-semibold mb-4">Add New Task</h2>
        <AddTaskForm />
      </div>
    </div>
  );
}
