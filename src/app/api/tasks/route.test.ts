import { describe, it, expect, vi } from 'vitest';
import { POST, GET } from './route.ts';
import { db } from '../../../lib/db';
import { tasks } from '../../../lib/schema';

vi.mock('../../../lib/db', () => ({
  db: {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockResolvedValue([{ id: 1, name: 'Test Task', listId: 1 }]),
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    returning: vi.fn().mockResolvedValue([{ id: 1, name: 'Test Task', listId: 1 }]),
  },
}));

describe('GET /api/tasks', () => {
  it('should return a list of tasks', async () => {
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual([{ id: 1, name: 'Test Task', listId: 1 }]);
  });
});

describe('POST /api/tasks', () => {
  it('should return a 201 status code and the new task', async () => {
    const request = new Request('http://localhost/api/tasks', {
      method: 'POST',
      body: JSON.stringify({ name: 'Test Task', listId: 1 }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data).toEqual({ message: 'Task created' });
  });
});
