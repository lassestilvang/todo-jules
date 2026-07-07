'use client';

import React, { useState } from 'react';
import { createList } from '@/app/actions/list';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface AddListFormProps {
    onListAdded?: () => void;
}

const AddListForm = ({ onListAdded }: AddListFormProps) => {
  const [name, setName] = useState('');
  const [color, setColor] = useState('#64748b');
  const [emoji, setEmoji] = useState('📋');
  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);

    try {
        const result = await createList(name, color, emoji);
        if (result.success) {
            toast.success('List created');
            setOpen(false);
            setName('');
            setColor('#64748b');
            setEmoji('📋');
            if(onListAdded) onListAdded();
        } else {
            toast.error(typeof result.error === 'string' ? result.error : 'Failed to create list');
        }
    } catch(e) {
        toast.error('An error occurred');
    } finally {
        setIsPending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      e.currentTarget.requestSubmit();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
            className="text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded-sm"
            aria-label="Create new list"
            title="Create new list"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create new list</DialogTitle>
          <DialogDescription className="sr-only">
            Fill out the form below to create a new list.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="py-4">
          <fieldset disabled={isPending} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              Name <span className="text-destructive" aria-hidden="true">*</span>
            </label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="List name"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="color" className="block text-sm font-medium mb-1">
                Color
              </label>
              <div className="flex items-center gap-2">
                <Input
                  type="color"
                  id="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-12 h-10 p-1"
                />
                <span className="text-sm text-muted-foreground">{color}</span>
              </div>
            </div>
            <div>
              <label htmlFor="emoji" className="block text-sm font-medium mb-1">
                Emoji <span className="text-destructive" aria-hidden="true">*</span>
              </label>
              <Input
                type="text"
                id="emoji"
                value={emoji}
                onChange={(e) => setEmoji(e.target.value)}
                maxLength={2}
                className="w-full"
                placeholder="📋"
                aria-describedby="emoji-helper"
                required
              />
              <p id="emoji-helper" className="text-[11px] text-muted-foreground mt-1.5">
                Tip: Press <kbd className="font-mono bg-muted/50 px-1 py-0.5 rounded border border-muted whitespace-nowrap">Win + .</kbd> or <kbd className="font-mono bg-muted/50 px-1 py-0.5 rounded border border-muted whitespace-nowrap">Cmd + Ctrl + Space</kbd>
              </p>
            </div>
          </div>
          <Button type="submit" disabled={isPending} className="w-full relative" aria-keyshortcuts="Control+Enter Meta+Enter">
            {isPending ? <><Loader2 className="animate-spin" aria-hidden="true" /> Creating...</> : (
              <>
                Create List
                <kbd className="absolute right-4 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                  ⌘/Ctrl Enter
                </kbd>
              </>
            )}
          </Button>
          </fieldset>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddListForm;
