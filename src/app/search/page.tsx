'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Task from '../../components/task';
// import { Task } from '@/lib/types';

import { Task as TaskType } from '@/lib/types';

const SearchContent = () => {
  const [tasks, setTasks] = useState<TaskType[]>([]);
  const searchParams = useSearchParams();
  const query = searchParams.get('query');

  useEffect(() => {
    if (query) {
      const fetchTasks = async () => {
        const response = await fetch(`/api/search?query=${query}`);
        const data = await response.json();
        setTasks(data as TaskType[]);
      };

      fetchTasks();
    }
  }, [query]);

  return (
    <div>
      <h1 className="text-2xl font-bold">Search Results for &quot;{query}&quot;</h1>
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
