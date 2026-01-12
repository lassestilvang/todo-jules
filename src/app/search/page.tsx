'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Task from '../../components/task';

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

const Search = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const searchParams = useSearchParams();
  const query = searchParams.get('query');

  useEffect(() => {
    if (query) {
      const fetchTasks = async () => {
        const response = await fetch(`/api/search?query=${query}`);
        const data = await response.json();
        setTasks(data);
      };

      fetchTasks();
    }
  }, [query]);

  return (
    <div>
      <h1 className="text-2xl font-bold">Search Results for "{query}"</h1>
      <div className="mt-4">
        {tasks.map((task) => (
          <Task key={task.id} task={task} />
        ))}
      </div>
    </div>
  );
};

export default Search;
