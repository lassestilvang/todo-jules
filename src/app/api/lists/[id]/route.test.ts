import { describe, it, expect, vi } from 'vitest';
import { PUT, DELETE } from './route';
import { db } from '@/lib/db';
import { lists } from '@/lib/schema';

vi.mock('@/lib/db', () => ({
  db: {
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    returning: vi.fn().mockResolvedValue([{ id: 1, name: 'Updated List', color: '#000', emoji: '✨' }]),
    delete: vi.fn().mockReturnThis(),
  },
}));

describe('PUT /api/lists/{id}', () => {
  it('should return a 200 status code and the updated list', async () => {
    const request = new Request('http://localhost/api/lists/1', {
      method: 'PUT',
      body: JSON.stringify({ name: 'Updated List', color: '#000', emoji: '✨' }),
    });

    const response = await PUT(request, { params: { id: '1' } });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ id: 1, name: 'Updated List', color: '#000', emoji: '✨' });
  });

  it('should return a 404 status code if the list is not found', async () => {
    vi.spyOn(db, 'returning').mockResolvedValueOnce([]);

    const request = new Request('http://localhost/api/lists/999', {
      method: 'PUT',
      body: JSON.stringify({ name: 'Updated List' }),
    });

    const response = await PUT(request, { params: { id: '999' } });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data).toEqual({ error: 'List not found' });
  });
});

describe('DELETE /api/lists/{id}', () => {
  it('should return a 204 status code', async () => {
    vi.spyOn(db, 'returning').mockResolvedValueOnce([{ id: 1 }]);
    const request = new Request('http://localhost/api/lists/1', {
      method: 'DELETE',
    });

    const response = await DELETE(request, { params: { id: '1' } });

    expect(response.status).toBe(204);
  });

  it('should return a 404 status code if the list is not found', async () => {
    vi.spyOn(db, 'returning').mockResolvedValueOnce([]);
    const request = new Request('http://localhost/api/lists/999', {
      method: 'DELETE',
    });

    const response = await DELETE(request, { params: { id: '999' } });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data).toEqual({ error: 'List not found' });
  });
});
