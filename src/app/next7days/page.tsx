'use client';

import React, { useEffect, useState } from 'react';
import Task from '../../../components/task';

interface Task {
  id: number;
  name: string;
  description: string;
  date: string;
  deadline: string;
  priority: string;
  completed: boolean;
  estimate: number;
  actualTime: number;
  labels: string;
  subtasks: string;
  recurring: string;
  attachment: string;
}

const Next7Days = () => {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    const fetchTasks = async () => {
      const response = await fetch('/api/tasks/next7days');
      const data = await response.json();
      setTasks(data);
    };

    fetchTasks();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold">Next 7 Days</h1>
      <div className="mt-4">
        {tasks.map((task) => (
          <Task key={task.id} task={task} />
        ))}
      </div>
    </div>
  );
};

export default Next7Days;
