'use client';

import React from 'react';
import { Task } from '@/lib/types';
import TaskComponent from '../task';
import { motion, AnimatePresence } from 'framer-motion';

interface TaskListProps {
  tasks: Task[];
}

export function TaskList({ tasks }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="text-center text-muted-foreground mt-8">
        <p>No tasks found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {tasks.map((task) => (
          <TaskComponent key={task.id} task={task} />
        ))}
      </AnimatePresence>
    </div>
  );
}
