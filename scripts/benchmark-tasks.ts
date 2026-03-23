import { GET } from '../src/app/api/tasks/route';

async function benchmark() {
  console.log('Starting benchmark...');

  // Mock Request
  const req = new Request('http://localhost/api/tasks?page=1&limit=20');

  // Warm up
  for (let i = 0; i < 5; i++) {
    await GET(req);
  }

  const start = performance.now();

  const ITERATIONS = 100;
  for (let i = 0; i < ITERATIONS; i++) {
    await GET(req);
  }

  const end = performance.now();
  const duration = end - start;
  const avgDuration = duration / ITERATIONS;

  console.log(`Ran ${ITERATIONS} iterations in ${duration.toFixed(2)}ms`);
  console.log(`Average duration: ${avgDuration.toFixed(2)}ms`);
}

benchmark().catch(console.error);
