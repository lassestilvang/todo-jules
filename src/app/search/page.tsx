'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Task from '../../components/task';
// import { Task } from '@/lib/types';

interface Task {
  id: number;
  name: string;
  description: string | null;
  date: string | null;
  deadline: string | null;
  priority: string | null;
  completed: boolean;
  estimate: number | null;
  actualTime: number | null;
  recurring: string | null;
  subtasks: any[];
  labels: any[];
  reminders: any[];
  attachments: any[];
}

const SearchContent = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const searchParams = useSearchParams();
  const query = searchParams.get('query');

  useEffect(() => {
    if (query) {
      const fetchTasks = async () => {
        const response = await fetch(`/api/search?query=${query}`);
        const data = await response.json();
        setTasks(data as Task[]);
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

const Search = () => {
  return (
    <Suspense fallback={<div>Loading search...</div>}>
      <SearchContent />
    </Suspense>
  );
};

export default Search;
