import { describe, it } from 'vitest';
import { db } from '../src/lib/db';
import { sql } from 'drizzle-orm';
import { tasks } from '../src/lib/schema';

describe('benchmark FTS5', () => {
  it('search speed FTS5 vs LIKE', async () => {
    // 1. Setup FTS5 Table
    console.log('Setting up FTS5 virtual table...');
    db.run(sql`DROP TABLE IF EXISTS tasks_fts`);
    db.run(sql`
      CREATE VIRTUAL TABLE tasks_fts USING fts5(
        name,
        description,
        content='tasks',
        content_rowid='id'
      )
    `);

    // 2. Populate FTS5 table
    console.log('Populating FTS5 table...');
    db.run(sql`
      INSERT INTO tasks_fts(rowid, name, description)
      SELECT id, name, description FROM tasks
    `);

    console.log('Starting FTS5 benchmark...');

    const queries = ['Task', 'Description', 'random', '999', 'Meeting'];
    let totalDuration = 0;
    const iterations = 5;

    for (const query of queries) {
      let queryDuration = 0;
      for (let i = 0; i < iterations; i++) {
        const start = performance.now();
        // FTS5 MATCH
        await db.all(sql`
          SELECT * FROM tasks
          WHERE id IN (
            SELECT rowid FROM tasks_fts
            WHERE tasks_fts MATCH ${query + '*'}
          )
          LIMIT 20
        `);
        const end = performance.now();
        queryDuration += (end - start);
      }
      const avg = queryDuration / iterations;
      console.log(`FTS5 Query "${query}": ${avg.toFixed(2)}ms (avg of ${iterations})`);
      totalDuration += queryDuration;
    }

    console.log(`Total time for ${queries.length * iterations} FTS5 queries: ${totalDuration.toFixed(2)}ms`);
    console.log(`Average per FTS5 query: ${(totalDuration / (queries.length * iterations)).toFixed(2)}ms`);

  }, 60000);
});
