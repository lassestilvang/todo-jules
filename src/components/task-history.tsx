'use client';

import React, { useEffect, useState } from 'react';
import { getTaskHistory } from '@/app/actions/history';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { History } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TaskHistoryProps {
  taskId: number;
}

interface HistoryItem {
  id: number;
  taskId: number;
  changedField: string;
  oldValue: string | null;
  newValue: string | null;
  changedAt: Date;
}

export function TaskHistory({ taskId }: TaskHistoryProps) {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (isOpen) {
        const fetchData = async () => {
            setLoading(true);
            try {
                const data = await getTaskHistory(taskId);
                if (isMounted) {
                    // @ts-expect-error type mismatch type mismatch
                    setHistory(data);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };
        fetchData();
    }
    return () => {
        isMounted = false;
    }
  }, [isOpen, taskId]);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" title="View History">
          <History className="h-4 w-4 mr-1" />
          History
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Task History</SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-4">
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : history.length === 0 ? (
            <p className="text-sm text-muted-foreground">No history recorded.</p>
          ) : (
            <ul className="space-y-4">
              {history.map((item) => (
                <li key={item.id} className="text-sm border-b pb-2">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>{new Date(item.changedAt).toLocaleString()}</span>
                    <span className="font-semibold capitalize">{item.changedField}</span>
                  </div>
                  <div>
                    {item.changedField === 'created' ? (
                      <span className="text-green-500">Task created</span>
                    ) : (
                      <>
                        <span className="line-through text-red-400 mr-2">
                          {item.oldValue || '(empty)'}
                        </span>
                        <span>&rarr;</span>
                        <span className="ml-2 text-green-500">
                          {item.newValue || '(empty)'}
                        </span>
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
