const Database = require('better-sqlite3');
const { performance } = require('perf_hooks');

const db = new Database(':memory:');

db.exec(`
  CREATE TABLE subtasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    completed INTEGER DEFAULT 0,
    task_id INTEGER
  )
`);

const SUBTASKS_COUNT = 500;

function seed() {
  const insert = db.prepare('INSERT INTO subtasks (name, completed, task_id) VALUES (?, ?, ?)');
  const insertMany = db.transaction((items) => {
    for (const item of items) insert.run(item.name, item.completed, item.task_id);
  });

  const data = [];
  for (let i = 0; i < SUBTASKS_COUNT; i++) {
    data.push({ name: `Subtask ${i}`, completed: 0, task_id: 1 });
  }
  insertMany(data);
}

// Simulates the current implementation: Async-like overhead (using Promises) and chunking
async function benchmarkCurrent() {
  const subtasks = db.prepare('SELECT id, name, completed FROM subtasks').all();
  const CHUNK_SIZE = 100;

  const start = performance.now();
  // We simulate the transaction overhead.
  // In reality, better-sqlite3 transactions are sync, but the code uses async/await
  // which introduces microtask delays between every DB operation.

  // Simulated async transaction
  await (async () => {
    // This is a simplified simulation of what happens when you await inside better-sqlite3 transaction
    // Every await goes to the event loop.
    for (let i = 0; i < subtasks.length; i += CHUNK_SIZE) {
      const chunk = subtasks.slice(i, i + CHUNK_SIZE);

      let sql = 'UPDATE subtasks SET name = CASE id ';
      const params = [];
      for (const item of chunk) {
        sql += 'WHEN ? THEN ? ';
        params.push(item.id, `Updated ${item.id}`);
      }
      sql += 'ELSE name END, completed = CASE id ';
      for (const item of chunk) {
        sql += 'WHEN ? THEN ? ';
        params.push(item.id, 1);
      }
      sql += 'ELSE completed END WHERE id IN (' + chunk.map(() => '?').join(',') + ')';
      params.push(...chunk.map(i => i.id));

      const stmt = db.prepare(sql);
      // Simulate await overhead
      await Promise.resolve();
      stmt.run(...params);
    }
  })();

  const end = performance.now();
  return end - start;
}

// Simulates the optimized implementation: Synchronous, no chunking (if within limits), or just sync overhead
function benchmarkOptimized() {
  const subtasks = db.prepare('SELECT id, name, completed FROM subtasks').all();

  const start = performance.now();
  db.transaction((items) => {
    // Single bulk update (or fewer chunks, but primarily NO ASYNC)
    let sql = 'UPDATE subtasks SET name = CASE id ';
    const params = [];
    for (const item of items) {
      sql += 'WHEN ? THEN ? ';
      params.push(item.id, `Bulk Updated ${item.id}`);
    }
    sql += 'ELSE name END, completed = CASE id ';
    for (const item of items) {
      sql += 'WHEN ? THEN ? ';
      params.push(item.id, 1);
    }
    sql += 'ELSE completed END WHERE id IN (' + items.map(() => '?').join(',') + ')';
    params.push(...items.map(i => i.id));

    db.prepare(sql).run(...params);
  })(subtasks);
  const end = performance.now();
  return end - start;
}

async function run() {
  seed();

  // Warm up
  await benchmarkCurrent();
  benchmarkOptimized();

  let currentTotal = 0;
  let optimizedTotal = 0;
  const iterations = 50;

  for(let i = 0; i < iterations; i++) {
    currentTotal += await benchmarkCurrent();
    optimizedTotal += benchmarkOptimized();
  }

  const currentAvg = currentTotal / iterations;
  const optimizedAvg = optimizedTotal / iterations;

  console.log(`Current Implementation (Simulated Async + Chunked): ${currentAvg.toFixed(4)}ms`);
  console.log(`Optimized Implementation (Synchronous Bulk): ${optimizedAvg.toFixed(4)}ms`);
  console.log(`Improvement: ${(((currentAvg - optimizedAvg) / currentAvg) * 100).toFixed(2)}%`);
}

run();
