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
    <header className="bg-card text-card-foreground border-b p-4 flex justify-between items-center">
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
            className="w-full pl-9 pr-8 bg-muted border-transparent text-foreground placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-keyshortcuts="/"
          />
          {query.length === 0 && (
            <kbd className="absolute right-2.5 hidden h-5 select-none items-center gap-1 rounded border border-border bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground sm:flex group-focus-within:opacity-0 transition-opacity pointer-events-none">
              <span className="text-xs">/</span>
            </kbd>
          )}
          {query.length > 0 && (
            <button
              type="button"
              onClick={() => { setQuery(''); inputRef.current?.focus(); }}
              aria-label="Clear search"
              title="Clear search"
              className="absolute right-2.5 text-muted-foreground hover:text-foreground flex items-center justify-center p-1 rounded-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring transition-colors"
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
