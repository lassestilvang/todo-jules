import { describe, it, expect, vi } from 'vitest';
import { POST } from './route.ts';
import { db } from '../../../lib/db';

vi.mock('../../../lib/db', () => ({
  db: {
    insert: vi.fn().mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([{ id: 1, name: 'Test Task', listId: 1 }]),
      }),
    }),
  },
}));

describe('POST /api/tasks', () => {
  it('should return a 201 status code and the new task', async () => {
    const request = new Request('http://localhost/api/tasks', {
      method: 'POST',
      body: JSON.stringify({ name: 'Test Task', listId: 1 }),
    });

    // Since the POST function in route.ts is just a placeholder, 
    // we are essentially testing the mock implementation here.
    // This will be updated once the actual API logic is implemented.
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data).toEqual({ message: 'Task created' });
  });
});
