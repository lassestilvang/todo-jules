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

    vi.mocked(db.transaction).mockImplementation((callback) => {
      const tx = {
        update: vi.fn().mockReturnThis(),
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnValue({
            all: vi.fn().mockReturnValue([updatedTask]),
            returning: vi.fn().mockReturnValue({
                all: vi.fn().mockReturnValue([updatedTask])
            })
        }),
        returning: vi.fn().mockReturnValue({
            all: vi.fn().mockReturnValue([updatedTask])
        }),
        delete: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        values: vi.fn().mockReturnValue({
            all: vi.fn().mockReturnValue([updatedTask]),
            run: vi.fn()
        }),
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
                all: vi.fn().mockReturnValue([updatedTask]),
                get: vi.fn().mockReturnValue(updatedTask)
            })
        }),
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return callback(tx as any);
    });

    const response = await PUT(request, { params: Promise.resolve({ id: '1' }) });
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

    const deleteMock = { where: vi.fn().mockReturnThis(), returning: vi.fn().mockResolvedValue([{}]) };
    vi.mocked(db.delete).mockReturnValue(deleteMock as unknown as ReturnType<typeof db.delete>);

    const response = await DELETE(request, { params: Promise.resolve({ id: '1' }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.message).toBe('Task deleted');
  });
});