'use client';

import React, { useState, useRef } from 'react';
import { createTask } from '@/app/actions/task';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { DateTimePicker } from '@/components/date-time-picker';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { useHotkeys } from 'react-hotkeys-hook';

interface AddTaskFormProps {
  onTaskAdded?: () => void;
  listId?: number;
}

// ⚡ Bolt Optimization: Hoist static configuration out of the render loop
// Why: Prevents unnecessary teardown and recreation of event listeners on every render.
const HOTKEYS_OPTIONS = { enableOnFormTags: false };

const AddTaskForm = ({ onTaskAdded, listId }: AddTaskFormProps) => {
  // const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [deadline, setDeadline] = useState<Date | undefined>(undefined);
  const [priority, setPriority] = useState('None');
  const [isPending, setIsPending] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useHotkeys('n', (e) => {
    e.preventDefault();
    inputRef.current?.focus();
    inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, HOTKEYS_OPTIONS);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      e.currentTarget.requestSubmit();
    }
  };

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
            // Focus the input to allow for continuous rapid entry
            setTimeout(() => inputRef.current?.focus(), 0);
        } else {
            toast.error('Failed to create task');
        }
    } catch (error) {
        console.error(error instanceof Error ? error.message : String(error));
        toast.error('An error occurred');
    } finally {
        setIsPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="bg-card p-6 rounded-lg border">
      <fieldset disabled={isPending} className="space-y-4">
      <div>
        <Label htmlFor="task-name" className="mb-1 block">
          Task Name <span className="text-destructive" aria-hidden="true">*</span>
        </Label>
        <div className="relative group">
          <Input
            ref={inputRef}
            disabled={isPending}
            type="text"
            id="task-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="What needs to be done?"
            required
            className="w-full pr-8"
            aria-keyshortcuts="n Alt+N"
          />
          {name.length === 0 && !isPending && (
            <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex group-focus-within:opacity-0 transition-opacity pointer-events-none">
              <span className="text-xs">n</span>
            </kbd>
          )}
        </div>
      </div>
      <div>
        <Label htmlFor="description" className="mb-1 block">
          Description
        </Label>
        <div className="relative">
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full flex min-h-[80px] resize-none rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm pb-6"
            placeholder="Add details..."
            maxLength={500}
            aria-describedby="description-helper"
          />
          <div
            id="description-helper"
            className={`absolute bottom-2 right-2 text-[10px] pointer-events-none select-none transition-colors ${
              description.length >= 480 ? 'text-destructive font-medium' :
              description.length >= 400 ? 'text-amber-700 dark:text-amber-500' :
              'text-muted-foreground'
            }`}
            aria-live={description.length >= 400 ? "polite" : "off"}
          >
            {description.length}/500
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
            <Label htmlFor="task-date" className="mb-1 block">Date</Label>
            <DateTimePicker id="task-date" date={date} setDate={setDate} label="Pick a date" />
        </div>
        <div>
            <Label htmlFor="task-deadline" className="mb-1 block">Deadline</Label>
            <DateTimePicker id="task-deadline" date={deadline} setDate={setDeadline} label="Set deadline" />
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
        className="w-full relative"
        aria-keyshortcuts={isPending ? undefined : "Meta+Enter Control+Enter"}
      >
        {isPending ? <><Loader2 className="animate-spin" aria-hidden="true" /> Adding...</> : (
            <>
                Add Task
                <kbd className="absolute right-4 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex pointer-events-none">
                    <span className="text-xs">⌘/Ctrl Enter</span>
                </kbd>
            </>
        )}
      </Button>
      </fieldset>
    </form>
  );
};

export default AddTaskForm;
