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
    select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
            limit: vi.fn().mockReturnValue({
                offset: vi.fn().mockReturnValue({
                    all: vi.fn().mockReturnValue([])
                })
            })
        })
    }),
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
    // Cache invalidation removed from setup to prevent interference with call count assertions
  });

  it('should return a paginated list of tasks', async () => {
    vi.mocked(cache.getTaskCount).mockReturnValue(10);

    const mockSelectChain = {
        from: vi.fn().mockReturnValue({
            limit: vi.fn().mockReturnValue({
                offset: vi.fn().mockReturnValue({
                    all: vi.fn().mockReturnValue([mockTask])
                })
            }),
            innerJoin: vi.fn().mockReturnValue({
                where: vi.fn().mockReturnValue({
                    all: vi.fn().mockReturnValue([])
                })
            })
        })
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(db.select).mockReturnValue(mockSelectChain as any);

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
    expect(db.select).toHaveBeenCalled();
    expect(cache.getTaskCount).toHaveBeenCalledTimes(1);
  });

  it('should handle pagination parameters correctly', async () => {
    vi.mocked(cache.getTaskCount).mockReturnValue(50);

    const mockOffset = vi.fn().mockReturnValue({ all: vi.fn().mockReturnValue([]) });
    const mockLimit = vi.fn().mockReturnValue({ offset: mockOffset });
    const mockSelectChain = {
        from: vi.fn().mockReturnValue({
            limit: mockLimit,
        })
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(db.select).mockReturnValue(mockSelectChain as any);

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
    expect(mockLimit).toHaveBeenCalledWith(5);
    expect(mockOffset).toHaveBeenCalledWith(10);
  });

  it('should use default values for invalid parameters', async () => {
    vi.mocked(cache.getTaskCount).mockReturnValue(10);

    const mockOffset = vi.fn().mockReturnValue({ all: vi.fn().mockReturnValue([]) });
    const mockLimit = vi.fn().mockReturnValue({ offset: mockOffset });
    const mockSelectChain = {
        from: vi.fn().mockReturnValue({
            limit: mockLimit,
        })
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(db.select).mockReturnValue(mockSelectChain as any);

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



    // @ts-expect-error Mocking transaction callback
    vi.mocked(db.transaction).mockImplementation((callback) => {
      // Mock the transaction context (tx)
      const returningMock = { all: vi.fn().mockReturnValue([{ id: 1, name: 'Test Task' }]) };
      const tx = {
        insert: vi.fn().mockReturnThis(),
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockReturnValue(returningMock),
        run: vi.fn()
      };
      return callback(tx);
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
