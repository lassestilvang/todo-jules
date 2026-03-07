'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Task from '../../components/task';
// import { Task } from '@/lib/types';

import { Task as TaskType } from '@/lib/types';
import { useDebounce } from '@/hooks/use-debounce';

const SearchContent = () => {
  const [tasks, setTasks] = useState<TaskType[]>([]);
  const searchParams = useSearchParams();
  const query = searchParams.get('query') || '';
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (!debouncedQuery) {
      setTasks([]);
      return;
    }

    const controller = new AbortController();
    const signal = controller.signal;

    const fetchTasks = async () => {
      try {
        const response = await fetch(`/api/search?query=${encodeURIComponent(debouncedQuery)}`, {
          signal,
        });
        if (!response.ok) {
          throw new Error('Search failed');
        }
        const data = await response.json();
        setTasks(data as TaskType[]);
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          // Ignore abort errors
          return;
        }
        console.error('Search error:', error);
      }
    };

    fetchTasks();

    return () => {
      controller.abort();
    };
  }, [debouncedQuery]);

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
