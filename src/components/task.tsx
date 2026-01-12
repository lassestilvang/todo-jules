'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface TaskProps {
  task: {
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
  };
}

const Task = ({ task }: TaskProps) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-gray-800 p-4 rounded-lg mb-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">{task.name}</h3>
        <span
          className={`px-2 py-1 rounded-full text-sm ${
            task.priority === 'High'
              ? 'bg-red-500'
              : task.priority === 'Medium'
              ? 'bg-yellow-500'
              : task.priority === 'Low'
              ? 'bg-green-500'
              : 'bg-gray-500'
          }`}
        >
          {task.priority}
        </span>
      </div>
      <p className="text-gray-400">{task.description}</p>
      <div className="flex items-center justify-between mt-4">
        <div>
          <p className="text-sm">
            <strong>Date:</strong> {task.date}
          </p>
          <p className="text-sm">
            <strong>Deadline:</strong> {task.deadline}
          </p>
        </div>
        <button
          className={`px-4 py-2 rounded ${
            task.completed ? 'bg-green-500' : 'bg-gray-500'
          }`}
        >
          {task.completed ? 'Completed' : 'Mark as complete'}
        </button>
      </div>
    </motion.div>
  );
};

export default Task;
