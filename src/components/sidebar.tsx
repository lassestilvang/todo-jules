'use client';

import React, { useEffect, useState } from 'react';
import AddListForm from './add-list-form';
import { motion } from 'framer-motion';

interface ListItem {
  id: number;
  name: string;
  color: string;
  emoji: string;
}

const Sidebar = () => {
  const [lists, setLists] = useState<ListItem[]>([]);

  useEffect(() => {
    const fetchLists = async () => {
      const response = await fetch('/api/lists');
      const data = await response.json();
      setLists(data);
    };

    fetchLists();
  }, []);

  return (
    <aside className="w-64 bg-gray-800 text-white p-4">
      <h2 className="text-xl font-bold mb-4">Task Planner</h2>
      <nav>
        <ul>
          <motion.li whileHover={{ scale: 1.1 }} className="mb-2">
            <a href="/today" className="hover:text-gray-300">
              Today
            </a>
          </motion.li>
          <motion.li whileHover={{ scale: 1.1 }} className="mb-2">
            <a href="#" className="hover:text-gray-300">
              Next 7 Days
            </a>
          </motion.li>
          <motion.li whileHover={{ scale: 1.1 }} className="mb-2">
            <a href="#" className="hover:text-gray-300">
              Upcoming
            </a>
          </motion.li>
          <motion.li whileHover={{ scale: 1.1 }} className="mb-2">
            <a href="/" className="hover:text-gray-300">
              All
            </a>
          </motion.li>
        </ul>
      </nav>
      <div className="mt-8">
        <h3 className="text-lg font-bold mb-2">My Lists</h3>
        <ul>
          {lists.map((list) => (
            <motion.li whileHover={{ scale: 1.1 }} key={list.id} className="mb-2">
              <span style={{ color: list.color }} className="mr-2">
                {list.emoji}
              </span>
              {list.name}
            </motion.li>
          ))}
        </ul>
        <AddListForm />
      </div>
    </aside>
  );
};

export default Sidebar;
