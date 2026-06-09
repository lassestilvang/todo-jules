'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Task from '../../components/task';
// import { Task } from '@/lib/types';

import { Task as TaskType } from '@/lib/types';
import { Search as SearchIcon, Loader2, CircleAlert } from 'lucide-react';

const SearchContent = () => {
  const [tasks, setTasks] = useState<TaskType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const searchParams = useSearchParams();
  const query = searchParams.get('query') || '';

  useEffect(() => {
    if (!query) {
      setTasks([]);
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();
    const signal = controller.signal;

    const fetchTasks = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/search?query=${encodeURIComponent(query)}`, {
          signal,
        });
        if (!response.ok) {
          throw new Error('Search failed');
        }
        const data = await response.json();
        setTasks(data as TaskType[]);
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          // Ignore abort errors
          return;
        }
        console.error('Search error:', err instanceof Error ? err.message : String(err));
        setError('Failed to search tasks. Please try again.');
        setTasks([]);
      } finally {
        if (!signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    fetchTasks();

    return () => {
      controller.abort();
    };
  }, [query]);

  return (
    <div>
      <h1 className="text-2xl font-bold">
        {query ? `Search Results for "${query}"` : "Search Tasks"}
      </h1>

      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {isLoading && "Searching tasks..."}
        {!isLoading && error && 'Search failed: ' + error}
        {!isLoading && query && tasks.length === 0 && 'No tasks found for "' + query + '"'}
        {!isLoading && query && tasks.length > 0 && 'Found ' + tasks.length + ' task' + (tasks.length === 1 ? '' : 's')}
      </div>

      <div className="mt-6">
        {!query ? (
          <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg bg-card/50 text-muted-foreground">
            <SearchIcon className="h-12 w-12 opacity-20 mb-4" aria-hidden="true" />
            <h3 className="text-lg font-medium text-foreground">Search Tasks</h3>
            <p className="text-sm mt-1">Enter a keyword in the search bar above to find tasks.</p>
          </div>
        ) : isLoading ? (
          <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg bg-card/50 text-muted-foreground">
            <Loader2 className="h-10 w-10 animate-spin mb-4 text-primary" aria-hidden="true" />
            <p className="text-sm">Searching tasks...</p>
          </div>
        ) : error ? (
          <div role="alert" className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg bg-destructive/10 text-destructive">
            <CircleAlert className="h-12 w-12 opacity-80 mb-4" aria-hidden="true" />
            <h3 className="text-lg font-medium">Search Failed</h3>
            <p className="text-sm mt-1">{error}</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg bg-card/50 text-muted-foreground">
            <SearchIcon className="h-12 w-12 opacity-20 mb-4" aria-hidden="true" />
            <h3 className="text-lg font-medium text-foreground">No tasks found</h3>
            <p className="text-sm mt-1">We couldn&apos;t find any tasks matching &quot;{query}&quot;. Try adjusting your search.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map((task) => (
              <Task key={task.id} task={task} />
            ))}
          </div>
        )}
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
