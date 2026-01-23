
import { GET } from '../src/app/api/tasks/route';

async function benchmark() {
  console.log('Starting benchmark...');

  // Mock Request
  const req = new Request('http://localhost/api/tasks?page=1&limit=20');

  const start = performance.now();

  // @ts-ignore
  const res = await GET(req);

  const end = performance.now();
  const duration = end - start;

  const data = await res.json();
  const count = Array.isArray(data) ? data.length : data.data.length;

  console.log(`Fetched ${count} tasks in ${duration.toFixed(2)}ms`);
}

benchmark().catch(console.error);
