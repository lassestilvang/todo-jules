import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';
import { db } from '@/lib/db';

vi.mock('@/lib/db', () => ({
  db: {
    select: vi.fn(),
  },
}));

describe('GET /api/search', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return empty array if no query provided', async () => {
    const request = new Request('http://localhost/api/search');
    const response = await GET(request);
    const data = await response.json();

    expect(data).toEqual([]);
    expect(db.select).not.toHaveBeenCalled();
  });

  it('should return search results', async () => {
    const mockTasks = [
      { id: 1, name: 'Search Result', description: 'Description' },
    ];

    vi.mocked(db.select).mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue(mockTasks)
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    const request = new Request('http://localhost/api/search?query=Search');
    const response = await GET(request);
    const data = await response.json();

    expect(data).toEqual(mockTasks);
    expect(db.select).toHaveBeenCalled();
  });
});
