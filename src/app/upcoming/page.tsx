import React from 'react';
import { getTasksForUpcoming } from '@/app/actions/task';
import { TaskList } from '@/components/lists/task-list';

export default async function UpcomingPage() {
  const tasks = await getTasksForUpcoming();

  return (
    <div className="container mx-auto max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Upcoming</h1>

      <div className="mb-8">
        <TaskList tasks={tasks} />
      </div>
    </div>
  );
}
