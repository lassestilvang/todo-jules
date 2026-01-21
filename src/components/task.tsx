'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Task } from '@/lib/types';
import { toggleTaskCompletion } from '@/app/actions/task';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock } from 'lucide-react';
import { TaskHistory } from '@/components/task-history';

interface TaskProps {
  task: Task;
}

const TaskComponent = ({ task }: TaskProps) => {
  const handleToggle = async (checked: boolean) => {
    await toggleTaskCompletion(task.id, checked);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={`mb-3 transition-colors hover:shadow-md ${task.completed ? 'opacity-60 bg-muted/50' : 'bg-card'}`}>
        <CardContent className="p-4 flex items-start gap-4">
          <div className="pt-1">
            <Checkbox
                 checked={task.completed ?? false}
                onCheckedChange={handleToggle}
            />
          </div>

          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
                <h3 className={`font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                    {task.name}
                </h3>
                <div className="flex items-center gap-2">
                    <TaskHistory taskId={task.id} />
                    {task.priority && task.priority !== 'None' && (
                    <Badge variant={
                        task.priority === 'High' ? 'destructive' :
                        task.priority === 'Medium' ? 'default' : 'secondary'
                    }>
                        {task.priority}
                    </Badge>
                    )}
                </div>
            </div>

            {task.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">{task.description}</p>
            )}

            <div className="flex flex-wrap gap-2 mt-2">
                {task.date && (
                    <div className="flex items-center text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(task.date).toLocaleDateString()}
                    </div>
                )}
                 {task.deadline && (
                    <div className="flex items-center text-xs text-red-400">
                        <Clock className="h-3 w-3 mr-1" />
                        {new Date(task.deadline).toLocaleDateString()}
                    </div>
                )}
            </div>

            {task.labels && task.labels.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {task.labels.map(({ label }) => label && (
                  <Badge
                    key={label.id}
                    variant="outline"
                    className="text-xs"
                    style={{
                        borderColor: label.color || undefined,
                        color: label.color || undefined
                    }}
                  >
                    {label.icon && <span className="mr-1">{label.icon}</span>}
                    {label.name}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default TaskComponent;
