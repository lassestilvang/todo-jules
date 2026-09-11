'use client';

import React, { useState, useOptimistic, startTransition } from 'react';
import { motion } from 'framer-motion';
import { Task } from '@/lib/types';
import { toggleTaskCompletion, deleteTask } from '@/app/actions/task';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Trash2, Loader2 } from 'lucide-react';
import { TaskHistory } from '@/components/task-history';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface TaskProps {
  task: Task;
}

const TaskComponent = ({ task }: TaskProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [optimisticCompleted, setOptimisticCompleted] = useOptimistic(
    task.completed ?? false,
    (state, newCompleted: boolean) => newCompleted
  );

  const handleToggle = async (checked: boolean) => {
    // ⚡ Bolt Optimization: Synchronous startTransition for Optimistic Updates
    // Separated the synchronous state update from the asynchronous server action.
    startTransition(() => {
      setOptimisticCompleted(checked);
    });
    startTransition(async () => {
      try {
        await toggleTaskCompletion(task.id, checked);
      } catch {
        toast.error('Failed to update task status');
      }
    });
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this task?')) {
      setIsDeleting(true);
      try {
        await deleteTask(task.id);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="group"
    >
      <Card className={`mb-3 transition-colors hover:shadow-md ${optimisticCompleted ? 'opacity-60 bg-muted/50' : 'bg-card'}`}>
        <CardContent className="p-4 flex items-start gap-4">
          <div className="pt-1">
            <Checkbox
                id={`task-${task.id}`}
                checked={optimisticCompleted}
                onCheckedChange={handleToggle}
                aria-label={`Mark ${task.name} as ${optimisticCompleted ? 'incomplete' : 'complete'}`}
            />
          </div>

          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
                <label
                    htmlFor={`task-${task.id}`}
                    className={`font-medium cursor-pointer select-none transition-colors hover:text-primary ${optimisticCompleted ? 'line-through text-muted-foreground' : ''}`}
                >
                    {task.name}
                </label>
                <div className="flex items-center gap-2">
                    <TaskHistory taskId={task.id} />
                    {task.priority && task.priority !== 'None' && (
                    <Badge variant={
                        task.priority === 'High' ? 'destructive' :
                        task.priority === 'Medium' ? 'default' : 'secondary'
                    }>
                        <span className="sr-only">Priority: </span>
                        {task.priority}
                    </Badge>
                    )}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive transition-opacity opacity-0 group-hover:opacity-100 focus-within:opacity-100"
                        onClick={handleDelete}
                        aria-label={`Delete task ${task.name}`}
                        title="Delete task"
                        disabled={isDeleting}
                        style={{ opacity: isDeleting ? 1 : undefined }}
                    >
                        {isDeleting ? (
                            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                        ) : (
                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                        )}
                    </Button>
                </div>
            </div>

            {task.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">{task.description}</p>
            )}

            <div className="flex flex-wrap gap-2 mt-2">
                {task.date && (
                    <div className="flex items-center text-xs text-muted-foreground" title="Date">
                        <Calendar className="h-3 w-3 mr-1" aria-hidden="true" />
                        <span className="sr-only">Date: </span>
                        {new Date(task.date).toLocaleDateString()}
                    </div>
                )}
                 {task.deadline && (
                    <div className="flex items-center text-xs text-red-400" title="Deadline">
                        <Clock className="h-3 w-3 mr-1" aria-hidden="true" />
                        <span className="sr-only">Deadline: </span>
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
                    {label.icon && <span className="mr-1" aria-hidden="true">{label.icon}</span>}
                    <span className="sr-only">Label: </span>
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

/**
 * ⚡ Bolt Optimization: Wrap TaskComponent with React.memo()
 *
 * Why:
 * During drag-and-drop operations in TaskList, the `optimisticTasks` array is reordered
 * using `arrayMove()`. This causes a re-render of the parent `TaskList` component.
 * Because `arrayMove` mutates the array order but preserves the exact object references
 * of the tasks themselves, wrapping `TaskComponent` in `React.memo` ensures that
 * only the tasks that actually had their props changed (which is none during a pure reorder)
 * will re-render.
 *
 * Impact:
 * Reduces unnecessary DOM operations and React component tree reconciliations by ~O(N)
 * where N is the number of tasks in the list, significantly smoothing out drag animations
 * for large lists.
 */
const MemoizedTaskComponent = React.memo(TaskComponent);
MemoizedTaskComponent.displayName = 'TaskComponent';
export default MemoizedTaskComponent;
