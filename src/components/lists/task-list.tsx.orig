'use client';

import React, { useOptimistic, useTransition } from 'react';
import { Task } from '@/lib/types';
import TaskComponent from '../task';
import { ClipboardList } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { reorderTasks } from '@/app/actions/reorder';
import { toast } from 'sonner';

interface TaskListProps {
  tasks: Task[];
}

interface SortableTaskItemProps {
    task: Task;
}

const SortableTaskItem = React.memo(function SortableTaskItemComponent({ task }: SortableTaskItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: task.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 1000 : 'auto',
        position: isDragging ? 'relative' as const : undefined,
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <TaskComponent task={task} />
        </div>
    );
});


export function TaskList({ tasks: initialTasks }: TaskListProps) {
  const [optimisticTasks, setOptimisticTasks] = useOptimistic(
    initialTasks,
    (state, newOrder: Task[]) => newOrder
  );
  const [, startTransition] = useTransition();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = optimisticTasks.findIndex((item) => item.id === active.id);
      const newIndex = optimisticTasks.findIndex((item) => item.id === over?.id);

      if (oldIndex === -1 || newIndex === -1) return;

      const newItems = arrayMove(optimisticTasks, oldIndex, newIndex);

      startTransition(async () => {
        setOptimisticTasks(newItems);

        // Optimization: Only update tasks that have actually changed their position
        const updates = newItems.reduce((acc, task, index) => {
          if (task.id !== optimisticTasks[index].id) {
            acc.push({
              id: task.id,
              order: index
            });
          }
          return acc;
        }, [] as { id: number; order: number }[]);

        try {
          const result = await reorderTasks(updates);
          if (!result.success) {
            throw new Error(result.error || "Failed to reorder tasks");
          }
        } catch (err) {
          console.error(err);
          toast.error("Failed to save new order");
        }
      });
    }
  };

  if (optimisticTasks.length === 0) {
    return (
      <div className="text-center p-12 mt-8 border-2 border-dashed rounded-lg bg-card/50">
        <div className="flex justify-center mb-4 text-muted-foreground">
<ClipboardList className="h-12 w-12 opacity-20" aria-hidden="true" />
        </div>
        <h3 className="text-lg font-medium text-foreground">No tasks found</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Get started by adding a new task below.
        </p>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={optimisticTasks.map(t => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-4">
            {optimisticTasks.map((task) => (
                <SortableTaskItem key={task.id} task={task} />
            ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
