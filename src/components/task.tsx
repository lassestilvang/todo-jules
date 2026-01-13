'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Task } from '../lib/types';

interface TaskProps {
  task: Task;
}

const Task = ({ task }: TaskProps) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-gray-800 p-4 rounded-lg mb-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">{task.name}</h3>
        {task.priority && task.priority !== 'None' && (
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
        )}
      </div>

      {task.description && (
        <p className="text-gray-400 mt-2">{task.description}</p>
      )}

      {task.labels.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {task.labels.map(({ label }) => (
            <span
              key={label.id}
              className="px-2 py-1 rounded-full text-xs"
              style={{ backgroundColor: label.color || '#4A5568' }}
            >
              {label.icon && <span className="mr-1">{label.icon}</span>}
              {label.name}
            </span>
          ))}
        </div>
      )}

      {task.subtasks.length > 0 && (
        <div className="mt-4">
          <h4 className="text-md font-semibold">Subtasks</h4>
          <ul className="list-disc list-inside mt-2">
            {task.subtasks.map((subtask) => (
              <li
                key={subtask.id}
                className={`${subtask.completed ? 'line-through text-gray-500' : ''}`}
              >
                {subtask.name}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex items-center justify-between mt-4">
        <div>
          {task.date && (
            <p className="text-sm">
              <strong>Date:</strong> {new Date(task.date).toLocaleDateString()}
            </p>
          )}
          {task.deadline && (
            <p className="text-sm">
              <strong>Deadline:</strong>{' '}
              {new Date(task.deadline).toLocaleDateString()}
            </p>
          )}
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
