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

interface CacheEntry {
  data: HistoryItem[];
  timestamp: number;
}

// Module-level cache to prevent redundant fetches
// Use a Map with a max size to prevent memory leaks and a TTL for staleness.
const historyCache = new Map<number, CacheEntry>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const MAX_CACHE_SIZE = 100;

function getFromCache(taskId: number): HistoryItem[] | null {
  const entry = historyCache.get(taskId);
  if (!entry) return null;

  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    historyCache.delete(taskId);
    return null;
  }
  return entry.data;
}

function setToCache(taskId: number, data: HistoryItem[]) {
  if (historyCache.size >= MAX_CACHE_SIZE) {
    // Remove oldest entry
    const oldestKey = historyCache.keys().next().value;
    if (oldestKey !== undefined) {
      historyCache.delete(oldestKey);
    }
  }
  historyCache.set(taskId, { data, timestamp: Date.now() });
}

export function TaskHistory({ taskId }: TaskHistoryProps) {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  // Reset state when taskId changes to prevent stale data
  useEffect(() => {
    // Check if we already have it in cache for the new taskId
    const cachedData = getFromCache(taskId);
    if (cachedData) {
      setHistory(cachedData);
      setHasFetched(true);
    } else {
      setHistory([]);
      setHasFetched(false);
    }
  }, [taskId]);

  useEffect(() => {
    let isMounted = true;
    if (isOpen && (!hasFetched || !getFromCache(taskId))) {
        const fetchData = async () => {
            const cachedData = getFromCache(taskId);
            if (cachedData) {
                if (isMounted) {
                    setHistory(cachedData);
                    setHasFetched(true);
                }
                return;
            }

            setLoading(true);
            try {
                const data = await getTaskHistory(taskId);
                if (isMounted) {
                    setToCache(taskId, data);
                    setHistory(data);
                    setHasFetched(true);
                }
            } catch (error) {
                console.error("Failed to fetch history", error);
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
  }, [isOpen, taskId, hasFetched]);

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

// For testing purposes
export function clearHistoryCache() {
  historyCache.clear();
}

export function invalidateTaskHistory(taskId: number) {
  historyCache.delete(taskId);
}
