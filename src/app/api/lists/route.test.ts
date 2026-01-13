import { describe, it, expect, vi } from 'vitest';
import { POST, GET } from './route.ts';
import { db } from '../../../lib/db';
import { lists } from '../../../lib/schema';

vi.mock('../../../lib/db', () => ({
  db: {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockResolvedValue([{ id: 1, name: 'Test List', color: '#fff', emoji: '🎉' }]),
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    returning: vi.fn().mockResolvedValue([{ id: 1, name: 'Test List', color: '#fff', emoji: '🎉' }]),
  },
}));

describe('GET /api/lists', () => {
  it('should return a list of lists', async () => {
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual([{ id: 1, name: 'Test List', color: '#fff', emoji: '🎉' }]);
  });
});

describe('POST /api/lists', () => {
  it('should return a 201 status code and the new list', async () => {
    const request = new Request('http://localhost/api/lists', {
      method: 'POST',
      body: JSON.stringify({ name: 'Test List', color: '#fff', emoji: '🎉' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data).toEqual({ id: 1, name: 'Test List', color: '#fff', emoji: '🎉' });
  });
});
