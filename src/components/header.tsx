'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';
import { useHotkeys } from 'react-hotkeys-hook';

// ⚡ Bolt Optimization: Hoist static configuration out of the render loop
// Why: Prevents unnecessary teardown and recreation of event listeners on every render.
const HOTKEYS_OPTIONS = { enableOnFormTags: false };

const Header = () => {
  const [query, setQuery] = useState('');
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useHotkeys('/', (e) => {
    e.preventDefault();
    inputRef.current?.focus();
  }, HOTKEYS_OPTIONS);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/search?query=${query}`);
  };

  return (
    <header className="bg-gray-800 text-white p-4 flex justify-between items-center">
      <h1 className="text-xl font-bold">Daily Task Planner</h1>
      <form onSubmit={handleSearch} className="relative w-full max-w-sm group">
        <label htmlFor="header-search-input" className="sr-only">
          Search tasks
        </label>
        <div className="relative flex items-center">
          <Search className="absolute left-2.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <Input
            ref={inputRef}
            id="header-search-input"
            type="search"
            placeholder="Search tasks..."
            className="w-full pl-9 pr-8 bg-gray-700 border-none text-white placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-white"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-keyshortcuts="/ Alt+/"
          />
          {query.length === 0 && (
            <kbd className="absolute right-2.5 hidden h-5 select-none items-center gap-1 rounded border border-gray-600 bg-gray-700 px-1.5 font-mono text-[10px] font-medium text-gray-400 sm:flex group-focus-within:opacity-0 transition-opacity">
              <span className="text-xs">/</span>
            </kbd>
          )}
          {query.length > 0 && (
            <button
              type="button"
              onClick={() => { setQuery(''); inputRef.current?.focus(); }}
              aria-label="Clear search"
              title="Clear search"
              className="absolute right-2.5 text-gray-400 hover:text-white flex items-center justify-center p-1 rounded-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white transition-colors"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>
      </form>
    </header>
  );
};

export default Header;
