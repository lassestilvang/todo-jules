import React from 'react';
import { getTasksForNext7Days } from '@/app/actions/task';
import { TaskList } from '@/components/lists/task-list';

export default async function Next7DaysPage() {
  const tasks = await getTasksForNext7Days();

  return (
    <div className="container mx-auto max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Next 7 Days</h1>

      <div className="mb-8">
        <TaskList tasks={tasks} />
      </div>
    </div>
  );
}
