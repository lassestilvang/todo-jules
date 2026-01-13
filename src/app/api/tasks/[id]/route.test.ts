import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PUT, DELETE } from './route';
import { db } from '../../../../lib/db';

vi.mock('../../../../lib/db', () => ({
  db: {
    transaction: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('PUT /api/tasks/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return a 200 status code and the updated task', async () => {
    const updatedTask = { id: 1, name: 'Updated Task' };
    const request = new Request('http://localhost/api/tasks/1', {
      method: 'PUT',
      body: JSON.stringify({ name: 'Updated Task' }),
    });

    vi.mocked(db.transaction).mockImplementation(async (callback) => {
      const tx = {
        update: vi.fn().mockReturnThis(),
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([updatedTask]),
        delete: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        values: vi.fn(),
      };
      return await callback(tx);
    });

    const response = await PUT(request, { params: { id: '1' } });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.message).toBe('Task updated');
    expect(data.task).toEqual(updatedTask);
    expect(db.transaction).toHaveBeenCalledTimes(1);
  });
});

describe('DELETE /api/tasks/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return a 200 status code and a success message', async () => {
    const request = new Request('http://localhost/api/tasks/1', {
      method: 'DELETE',
    });

    const deleteMock = { where: vi.fn().mockResolvedValue(undefined) };
    vi.mocked(db.delete).mockReturnValue(deleteMock as any);

    const response = await DELETE(request, { params: { id: '1' } });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.message).toBe('Task deleted');
  });
});
