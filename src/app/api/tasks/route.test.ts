import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST, GET } from './route'; // Assumed .ts
import { db } from '../../../lib/db';
import * as cache from '../../../lib/cache';
import * as taskUtils from '../../../lib/task-utils';

const mockAll = vi.fn();

// Mock dependencies
vi.mock('../../../lib/db', () => {
  const mockAll = vi.fn();
  const mockOffset = vi.fn().mockReturnValue({ all: mockAll });
  const mockLimit = vi.fn().mockReturnValue({ offset: mockOffset });
  const mockFrom = vi.fn().mockReturnValue({ limit: mockLimit });
  const mockSelect = vi.fn().mockReturnValue({ from: mockFrom });

  return {
    db: {
      transaction: vi.fn(),
      select: mockSelect,
    },
    // We export these internal mocks for tests to inspect if needed via db._mocks
    // Note: Vitest vi.mock can be tricky with exported internals, so we'll just check calls through the chain in tests or export a spy helper.
  };
});

vi.mock('../../../lib/cache', () => ({
  getTaskCount: vi.fn(),
  invalidateTaskCountCache: vi.fn(),
}));

vi.mock('../../../lib/task-utils', () => ({
  attachLabelsToTasks: vi.fn(),
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

    // @ts-expect-error mock chain
    const mockAllMethod = db.select().from().limit().offset().all;
    vi.mocked(mockAllMethod).mockReturnValue([mockTask]);
    vi.mocked(taskUtils.attachLabelsToTasks).mockResolvedValue([mockTask] as unknown);

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
    // @ts-expect-error mock chain
    expect(db.select().from().limit).toHaveBeenCalledWith(10);
    // @ts-expect-error mock chain
    expect(db.select().from().limit().offset).toHaveBeenCalledWith(0);
    expect(mockAllMethod).toHaveBeenCalled();
    expect(cache.getTaskCount).toHaveBeenCalledTimes(1);
  });

  it('should handle pagination parameters correctly', async () => {
    vi.mocked(cache.getTaskCount).mockReturnValue(50);

    // @ts-expect-error mock chain
    const mockAllMethod = db.select().from().limit().offset().all;
    vi.mocked(mockAllMethod).mockReturnValue([]);
    vi.mocked(taskUtils.attachLabelsToTasks).mockResolvedValue([] as unknown);

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
    expect(db.select).toHaveBeenCalled();
    // @ts-expect-error mock chain
    expect(db.select().from().limit).toHaveBeenCalledWith(5);
    // @ts-expect-error mock chain
    expect(db.select().from().limit().offset).toHaveBeenCalledWith(10);
    expect(mockAllMethod).toHaveBeenCalled();

  });

  it('should use default values for invalid parameters', async () => {
    vi.mocked(cache.getTaskCount).mockReturnValue(10);

    // @ts-expect-error mock chain
    const mockAllMethod = db.select().from().limit().offset().all;
    vi.mocked(mockAllMethod).mockReturnValue([]);
    vi.mocked(taskUtils.attachLabelsToTasks).mockResolvedValue([] as unknown);

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
