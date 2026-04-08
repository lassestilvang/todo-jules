import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TaskHistory, clearHistoryCache } from './task-history';
import * as historyActions from '@/app/actions/history';
import React from 'react';

// Mock the server action
vi.mock('@/app/actions/history', () => ({
  getTaskHistory: vi.fn(),
}));

// Mock the UI components from shadcn/ui to simplify testing
vi.mock('@/components/ui/sheet', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Sheet: ({ children, open, onOpenChange }: any) => (
    <div data-testid="sheet" data-open={open}>
        {children}
        <button onClick={() => onOpenChange(!open)}>Toggle Sheet</button>
    </div>
  ),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  SheetContent: ({ children }: any) => <div data-testid="sheet-content">{children}</div>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  SheetHeader: ({ children }: any) => <div>{children}</div>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  SheetTitle: ({ children }: any) => <div>{children}</div>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  SheetTrigger: ({ children }: any) => <div>{children}</div>,
}));

vi.mock('@/components/ui/button', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
}));

describe('TaskHistory Performance', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearHistoryCache();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('prevents redundant fetch when unmounted and remounted within TTL', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });

    const mockHistory = [
      { id: 1, taskId: 1, changedField: 'created', oldValue: null, newValue: 'Task created', changedAt: new Date() },
    ];
    vi.mocked(historyActions.getTaskHistory).mockResolvedValue(mockHistory);

    const { unmount } = render(<TaskHistory taskId={1} />);

    let toggleButton = screen.getByText('Toggle Sheet');
    fireEvent.click(toggleButton);

    await waitFor(() => {
      expect(historyActions.getTaskHistory).toHaveBeenCalledTimes(1);
    });

    unmount();

    // Advance time slightly, well within TTL (e.g. 1 minute)
    vi.advanceTimersByTime(60 * 1000);

    render(<TaskHistory taskId={1} />);
    toggleButton = screen.getByText('Toggle Sheet');
    fireEvent.click(toggleButton);

    await waitFor(() => {
      // Still only called once
      expect(historyActions.getTaskHistory).toHaveBeenCalledTimes(1);
    });
    vi.useRealTimers();
  });

  it('refetches when unmounted and remounted after TTL expires', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const mockHistory = [
      { id: 1, taskId: 1, changedField: 'created', oldValue: null, newValue: 'Task created', changedAt: new Date() },
    ];
    vi.mocked(historyActions.getTaskHistory).mockResolvedValue(mockHistory);

    const { unmount } = render(<TaskHistory taskId={1} />);

    let toggleButton = screen.getByText('Toggle Sheet');
    fireEvent.click(toggleButton);

    await waitFor(() => {
      expect(historyActions.getTaskHistory).toHaveBeenCalledTimes(1);
    });

    unmount();

    // Advance time beyond TTL (5 minutes + 1 second)
    vi.advanceTimersByTime((5 * 60 * 1000) + 1000);

    render(<TaskHistory taskId={1} />);
    toggleButton = screen.getByText('Toggle Sheet');
    fireEvent.click(toggleButton);

    await waitFor(() => {
      // Should fetch again
      expect(historyActions.getTaskHistory).toHaveBeenCalledTimes(2);
    });
    vi.useRealTimers();
  });
});
