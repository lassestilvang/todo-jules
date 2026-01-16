'use client';

import React, { useState } from 'react';
import { createList } from '@/app/actions/list';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
            className="text-muted-foreground hover:text-foreground"
            aria-label="Create new list"
        >
          <Plus className="h-4 w-4" />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create new list</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              Name
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
                Emoji
              </label>
              <Input
                type="text"
                id="emoji"
                value={emoji}
                onChange={(e) => setEmoji(e.target.value)}
                maxLength={2}
                className="w-full"
                required
              />
            </div>
          </div>
          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? 'Creating...' : 'Create List'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddListForm;
