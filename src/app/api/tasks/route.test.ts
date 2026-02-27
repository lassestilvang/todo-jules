import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST, GET } from './route.ts';
import { db } from '../../../lib/db';
import { getTaskCount, invalidateTaskCountCache } from '../../../lib/cache';

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
    vi.mocked(getTaskCount).mockResolvedValue(10);
    vi.mocked(db.query.tasks.findMany).mockResolvedValue([mockTask]);

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
    expect(getTaskCount).toHaveBeenCalledTimes(1);
  });

  it('should handle pagination parameters correctly', async () => {
    vi.mocked(getTaskCount).mockResolvedValue(50);
    vi.mocked(db.query.tasks.findMany).mockResolvedValue([]);

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
    vi.mocked(getTaskCount).mockResolvedValue(10);
    vi.mocked(db.query.tasks.findMany).mockResolvedValue([]);

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

    const mockTx = {
      insert: vi.fn().mockReturnThis(),
      values: vi.fn().mockReturnThis(),
      returning: vi.fn().mockResolvedValue([{ id: 1, name: 'Test Task' }]),
    };

    // @ts-expect-error Mocking transaction callback
    vi.mocked(db.transaction).mockImplementation(async (callback) => {
      return await callback(mockTx);
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.message).toBe('Task created');
    expect(data.task).toBeDefined();
    expect(data.task.name).toBe(newTask.name);
    expect(db.transaction).toHaveBeenCalledTimes(1);
    expect(invalidateTaskCountCache).toHaveBeenCalledTimes(1);
  });
});
