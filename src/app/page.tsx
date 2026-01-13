'use client';

import React, { useEffect, useState } from 'react';
import AddTaskForm from '../components/add-task-form';
import TaskComponent from '../components/task';
import { Task } from '../lib/types';

const Home = () => {
  const [tasks, setTasks] = useState<Task[]>([]);

  const fetchTasks = async () => {
    const response = await fetch('/api/tasks');
    const data = await response.json();
    setTasks(data);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold">Inbox</h1>
      <div className="mt-4">
        {tasks.map((task) => (
          <TaskComponent key={task.id} task={task} />
        ))}
      </div>
      <AddTaskForm onTaskAdded={fetchTasks} />
    </div>
  );
};

export default Home;
