import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST, GET } from './route'; // Assumed .ts
import { db } from '../../../lib/db';
import * as cache from '../../../lib/cache';

// Mock dependencies
vi.mock('../../../lib/db', () => ({
  db: {
    query: {
      tasks: {
        findMany: vi.fn(),
      },
    },
    transaction: vi.fn(),
    select: vi.fn(),
  },
}));

vi.mock('../../../lib/cache', () => ({
  getTaskCount: vi.fn(),
  invalidateTaskCountCache: vi.fn(),
}));

const mockTask = {
  id: 1,
  name: 'Test Task',
  listId: 1,
  subtasks: [],
  labels: [],
  reminders: [],
  attachments: [],
};

describe('GET /api/tasks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return a paginated list of tasks', async () => {
    vi.mocked(db.query.tasks.findMany).mockResolvedValue([mockTask]);
    // Mock getTaskCount
    vi.mocked(cache.getTaskCount).mockResolvedValue(10);

    const request = new Request('http://localhost/api/tasks?page=1&limit=10');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data).toEqual([mockTask]);
    expect(data.meta).toEqual({
      total: 10,
      page: 1,
      limit: 10,
      totalPages: 1
    });
    expect(db.query.tasks.findMany).toHaveBeenCalledTimes(1);
    expect(db.query.tasks.findMany).toHaveBeenCalledWith({
        limit: 10,
        offset: 0,
        with: expect.any(Object)
    });
  });

  it('should handle pagination parameters correctly', async () => {
    vi.mocked(db.query.tasks.findMany).mockResolvedValue([]);
    vi.mocked(cache.getTaskCount).mockResolvedValue(50);

    const request = new Request('http://localhost/api/tasks?page=3&limit=5');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.meta).toEqual({
      total: 50,
      page: 3,
      limit: 5,
      totalPages: 10
    });
    expect(db.query.tasks.findMany).toHaveBeenCalledWith({
        limit: 5,
        offset: 10, // (3-1) * 5
        with: expect.any(Object)
    });
  });

  it('should use default values for invalid parameters', async () => {
    vi.mocked(db.query.tasks.findMany).mockResolvedValue([]);
    vi.mocked(cache.getTaskCount).mockResolvedValue(10);

    // Test with invalid page and limit
    const request = new Request('http://localhost/api/tasks?page=abc&limit=-5');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.meta).toEqual({
      total: 10,
      page: 1, // Default
      limit: 20, // Default
      totalPages: 1
    });
  });
});

describe('POST /api/tasks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return a 201 status code and the new task', async () => {
    const newTask = { name: 'Test Task', listId: 1 };
    const request = new Request('http://localhost/api/tasks', {
      method: 'POST',
      body: JSON.stringify(newTask),
    });

    vi.mocked(db.transaction).mockImplementation(async (callback) => {
      // Mock the transaction context (tx)
      const tx = {
        insert: vi.fn().mockReturnThis(),
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([{ id: 1, name: 'Test Task' }]),
      };
      // Execute the callback with the mock tx
      // @ts-ignore
      return await callback(tx);
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.message).toBe('Task created');
    expect(data.task).toBeDefined();
    expect(data.task.name).toBe(newTask.name);
    expect(db.transaction).toHaveBeenCalledTimes(1);
    expect(cache.invalidateTaskCountCache).toHaveBeenCalledTimes(1);
  });
});
