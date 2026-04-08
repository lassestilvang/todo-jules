/* @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TaskHistory } from './task-history';
import * as historyActions from '@/app/actions/history';
import React from 'react';

// Mock the server action
vi.mock('@/app/actions/history', () => ({
  getTaskHistory: vi.fn(),
}));

// Mock the UI components from shadcn/ui to simplify testing
vi.mock('@/components/ui/sheet', () => ({
  Sheet: ({ children, open, onOpenChange }: any) => (
    <div data-testid="sheet" data-open={open}>
        {children}
        <button onClick={() => onOpenChange(!open)}>Toggle Sheet</button>
    </div>
  ),
  SheetContent: ({ children }: any) => <div data-testid="sheet-content">{children}</div>,
  SheetHeader: ({ children }: any) => <div>{children}</div>,
  SheetTitle: ({ children }: any) => <div>{children}</div>,
  SheetTrigger: ({ children }: any) => <div>{children}</div>,
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
}));

describe('TaskHistory Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches history when opened', async () => {
    const mockHistory = [
      { id: 1, taskId: 1, changedField: 'created', oldValue: null, newValue: 'Task created', changedAt: new Date() },
    ];
    vi.mocked(historyActions.getTaskHistory).mockResolvedValue(mockHistory);

    render(<TaskHistory taskId={1} />);

    const toggleButton = screen.getByText('Toggle Sheet');

    // Open the sheet
    fireEvent.click(toggleButton);

    await waitFor(() => {
      expect(historyActions.getTaskHistory).toHaveBeenCalledWith(1);
    });

    expect(screen.getByText('Task created')).toBeDefined();
  });

  it('fetches history again when closed and re-opened (Baseline behavior)', async () => {
    const mockHistory = [
      { id: 1, taskId: 1, changedField: 'created', oldValue: null, newValue: 'Task created', changedAt: new Date() },
    ];
    vi.mocked(historyActions.getTaskHistory).mockResolvedValue(mockHistory);

    render(<TaskHistory taskId={1} />);

    const toggleButton = screen.getByText('Toggle Sheet');

    // First open
    fireEvent.click(toggleButton);
    await waitFor(() => {
      expect(historyActions.getTaskHistory).toHaveBeenCalledTimes(1);
    });

    // Close
    fireEvent.click(toggleButton);

    // Second open
    fireEvent.click(toggleButton);
    await waitFor(() => {
      // In the optimized implementation, it should still be called only once
      expect(historyActions.getTaskHistory).toHaveBeenCalledTimes(1);
    });
  });

  it('fetches new history when taskId changes', async () => {
    const mockHistory1 = [{ id: 1, taskId: 1, changedField: 'created', oldValue: null, newValue: 'Task 1 created', changedAt: new Date() }];
    const mockHistory2 = [{ id: 2, taskId: 2, changedField: 'created', oldValue: null, newValue: 'Task 2 created', changedAt: new Date() }];

    vi.mocked(historyActions.getTaskHistory)
      .mockResolvedValueOnce(mockHistory1)
      .mockResolvedValueOnce(mockHistory2);

    const { rerender } = render(<TaskHistory taskId={1} />);

    const toggleButton = screen.getByText('Toggle Sheet');

    // Open for taskId 1
    fireEvent.click(toggleButton);
    await waitFor(() => {
      expect(historyActions.getTaskHistory).toHaveBeenCalledWith(1);
      expect(screen.getByText('Task created')).toBeInTheDocument();
    });

    // Close
    fireEvent.click(toggleButton);

    // Rerender with taskId 2
    rerender(<TaskHistory taskId={2} />);

    // Open for taskId 2
    fireEvent.click(toggleButton);
    await waitFor(() => {
      expect(historyActions.getTaskHistory).toHaveBeenCalledWith(2);
      expect(screen.getByText('Task created')).toBeDefined();
    });

    expect(historyActions.getTaskHistory).toHaveBeenCalledTimes(2);
  });
});
