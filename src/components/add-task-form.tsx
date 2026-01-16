'use client';

import React, { useState } from 'react';
import { createTask } from '@/app/actions/task';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface AddTaskFormProps {
  onTaskAdded?: () => void;
  listId?: number;
}

const AddTaskForm = ({ onTaskAdded, listId }: AddTaskFormProps) => {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [deadline, setDeadline] = useState('');
  const [priority, setPriority] = useState('None');
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);

    const formData = {
        name,
        description,
        priority: priority as 'None' | 'Low' | 'Medium' | 'High' | undefined,
        // Using string date, schema will transform it
        date: date || undefined,
        listId,
    }

    try {
        // @ts-ignore
        const result = await createTask(formData);

        if (result.success) {
            toast.success('Task created');
            setName('');
            setDescription('');
            setDate('');
            setDeadline('');
            setPriority('None');
            if (onTaskAdded) {
                onTaskAdded();
            }
        } else {
            toast.error('Failed to create task');
        }
    } catch (error) {
        toast.error('An error occurred');
    } finally {
        setIsPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-card p-6 rounded-lg border">
      <div>
        <label htmlFor="task-name" className="block text-sm font-medium mb-1">
          Task Name
        </label>
        <Input
          type="text"
          id="task-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="What needs to be done?"
          required
        />
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium mb-1">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full flex min-h-[80px] rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
          placeholder="Add details..."
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
            <label htmlFor="date" className="block text-sm font-medium mb-1">
            Date
            </label>
            <Input
            type="date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            />
        </div>
        <div>
            <label htmlFor="priority" className="block text-sm font-medium mb-1">
            Priority
            </label>
            <select
            id="priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
            >
            <option value="None">None</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            </select>
        </div>
      </div>
      <Button
        type="submit"
        disabled={isPending}
        className="w-full"
      >
        {isPending ? 'Adding...' : 'Add Task'}
      </Button>
    </form>
  );
};

export default AddTaskForm;
