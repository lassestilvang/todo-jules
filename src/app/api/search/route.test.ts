import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';
import { db } from '@/lib/db';

vi.mock('@/lib/task-utils', () => ({
  attachLabelsToTasks: vi.fn((tasks) => tasks),
}));

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

  it('should return 400 Bad Request if query is longer than 100 characters', async () => {
    const longQuery = 'a'.repeat(101);
    const request = new Request(`http://localhost/api/search?query=${longQuery}`);
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Query too long');
    expect(db.select).not.toHaveBeenCalled();
  });

  it('should return empty array if query only contains special characters', async () => {
    const request = new Request('http://localhost/api/search?query=!!--++');
    const response = await GET(request);
    const data = await response.json();

    expect(data).toEqual([]);
    expect(db.select).not.toHaveBeenCalled();
  });

  it('should sanitize query and return search results', async () => {
    const mockTasks = [
      { id: 1, name: 'Search Result', description: 'Description' },
    ];

    const whereMock = vi.fn().mockReturnValue({
      limit: vi.fn().mockReturnValue({ all: vi.fn().mockReturnValue(mockTasks) })
    });

    vi.mocked(db.select).mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: whereMock
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    const request = new Request('http://localhost/api/search?query=Search!!--123');
    const response = await GET(request);
    const data = await response.json();

    expect(data).toEqual(mockTasks);
    expect(db.select).toHaveBeenCalled();

    // Check that the where clause was called with the sanitized query inside the SQL template
    const sqlCallArg = whereMock.mock.calls[0][0];
    expect(sqlCallArg.queryChunks).toBeDefined();
    // Reconstruct the rough SQL representation from the drizzle sql tag
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sqlString = sqlCallArg.queryChunks.map((chunk: any) => typeof chunk === 'string' ? chunk : JSON.stringify(chunk.value)).join('');
    expect(sqlString).toContain('"Search123"*');
  });

  it('should return search results', async () => {
    const mockTasks = [
      { id: 1, name: 'Search Result', description: 'Description' },
    ];

    vi.mocked(db.select).mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockReturnValue({ all: vi.fn().mockReturnValue(mockTasks) })
        })
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
