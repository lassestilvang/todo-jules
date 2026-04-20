'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

const Header = () => {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/search?query=${query}`);
  };

  return (
    <header className="bg-gray-800 text-white p-4 flex justify-between items-center">
      <h1 className="text-xl font-bold">Daily Task Planner</h1>
      <form onSubmit={handleSearch} className="relative w-full max-w-sm">
        <label htmlFor="header-search-input" className="sr-only">
          Search tasks
        </label>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <Input
            id="header-search-input"
            type="search"
            placeholder="Search tasks..."
            className="w-full pl-9 bg-gray-700 border-none text-white placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-white"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </form>
    </header>
  );
};

export default Header;
