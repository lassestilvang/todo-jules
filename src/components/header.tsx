'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

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
      <form onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search tasks..."
          className="w-full p-2 bg-gray-700 rounded"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </form>
    </header>
  );
};

export default Header;
