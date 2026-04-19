import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PUT, DELETE } from './route';
import { db } from '@/lib/db';
import { lists } from '@/lib/schema';

vi.mock('@/lib/db', () => ({
  db: {
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    returning: vi.fn(),
    delete: vi.fn().mockReturnThis(),
  },
}));

describe('PUT /api/lists/{id}', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return a 200 status code and the updated list', async () => {
    db.where = vi.fn().mockReturnValue({ returning: vi.fn().mockResolvedValue([{ id: 1, name: 'Updated List', color: '#000000', emoji: '✨' }]) });

    const request = new Request('http://localhost/api/lists/1', {
      method: 'PUT',
      body: JSON.stringify({ name: 'Updated List', color: '#000000', emoji: '✨' }),
    });

    const response = await PUT(request, { params: Promise.resolve({ id: '1' }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ id: 1, name: 'Updated List', color: '#000000', emoji: '✨' });
  });

  it('should return a 404 status code if the list is not found', async () => {
    db.where = vi.fn().mockReturnValue({ returning: vi.fn().mockResolvedValue([]) });

    const request = new Request('http://localhost/api/lists/999', {
      method: 'PUT',
      body: JSON.stringify({ name: 'Updated List' }),
    });

    const response = await PUT(request, { params: Promise.resolve({ id: '999' }) });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data).toEqual({ error: 'List not found' });
  });
});

describe('DELETE /api/lists/{id}', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return a 204 status code', async () => {
    db.where = vi.fn().mockReturnValue({ returning: vi.fn().mockResolvedValue([{ id: 1 }]) });
    const request = new Request('http://localhost/api/lists/1', {
      method: 'DELETE',
    });

    const response = await DELETE(request, { params: Promise.resolve({ id: '1' }) });

    expect(response.status).toBe(204);
  });

  it('should return a 404 status code if the list is not found', async () => {
    db.where = vi.fn().mockReturnValue({ returning: vi.fn().mockResolvedValue([]) });
    const request = new Request('http://localhost/api/lists/999', {
      method: 'DELETE',
    });

    const response = await DELETE(request, { params: Promise.resolve({ id: '999' }) });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data).toEqual({ error: 'List not found' });
  });
});