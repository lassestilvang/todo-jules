'use client';

import React, { useOptimistic, useTransition } from 'react';
import { Task } from '@/lib/types';
import TaskComponent from '../task';
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

function SortableTaskItem({ task }: SortableTaskItemProps) {
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
}


export function TaskList({ tasks: initialTasks }: TaskListProps) {
  const [optimisticTasks, setOptimisticTasks] = useOptimistic(
    initialTasks,
    (state, newOrder: Task[]) => newOrder
  );
  const [isPending, startTransition] = useTransition();

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

        const updates = newItems.map((task, index) => ({
            id: task.id,
            order: index
        }));

        try {
          const result = await reorderTasks(updates);
          if (!result.success) {
            throw new Error(result.error || "Failed to reorder tasks");
          }
        } catch (err) {
          console.error(err);
          toast.error("Failed to save new order");
          // No need to manually revert, useOptimistic handles it if the action fails/throws
          // or if we trigger a revalidation that restores the original state.
          // However, useOptimistic only reverts when the transition finishes if the *parent state* didn't update.
          // Since reorderTasks calls revalidatePath, the parent component should re-render with the source-of-truth data.
          // If the server action fails, the transition ends, and optimistic state is discarded.
        }
      });
    }
  };

  if (optimisticTasks.length === 0) {
    return (
      <div className="text-center text-muted-foreground mt-8">
        <p>No tasks found.</p>
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
