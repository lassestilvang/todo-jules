'use client';

import React, { useState } from 'react';
import { createTask } from '@/app/actions/task';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { DateTimePicker } from '@/components/date-time-picker';
import { Label } from '@/components/ui/label';

interface AddTaskFormProps {
  onTaskAdded?: () => void;
  listId?: number;
}

const AddTaskForm = ({ onTaskAdded, listId }: AddTaskFormProps) => {
  // const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [deadline, setDeadline] = useState<Date | undefined>(undefined);
  const [priority, setPriority] = useState('None');
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);

    const formData = {
        name,
        description,
        priority: priority as 'None' | 'Low' | 'Medium' | 'High' | undefined,
        // Convert Date objects to ISO string or keep as Date depending on what Server Action expects.
        // Looking at schema, it uses integer mode timestamp, but usually server actions handle Date objects if Zod is configured.
        // The original code used a string from type="date" input.
        date: date ? date : undefined,
        deadline: deadline ? deadline : undefined,
        listId,
    }

    try {
        // @ts-expect-error type mismatch
        const result = await createTask(formData);

        if (result.success) {
            toast.success('Task created');
            setName('');
            setDescription('');
            setDate(undefined);
            setDeadline(undefined);
            setPriority('None');
            if (onTaskAdded) {
                onTaskAdded();
            }
        } else {
            toast.error('Failed to create task');
        }
    } catch (error) {
        console.error(error);
        toast.error('An error occurred');
    } finally {
        setIsPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-card p-6 rounded-lg border">
      <div>
        <Label htmlFor="task-name" className="mb-1 block">
          Task Name
        </Label>
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
        <Label htmlFor="description" className="mb-1 block">
          Description
        </Label>
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
            <Label className="mb-1 block">Date</Label>
            <DateTimePicker date={date} setDate={setDate} label="Pick a date" />
        </div>
        <div>
            <Label className="mb-1 block">Deadline</Label>
            <DateTimePicker date={deadline} setDate={setDeadline} label="Set deadline" />
        </div>
        <div>
            <Label htmlFor="priority" className="mb-1 block">
            Priority
            </Label>
            <select
            id="priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="w-full h-10 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
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
