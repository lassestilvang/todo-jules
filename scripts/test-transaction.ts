import { db } from '../src/lib/db';
import { tasks } from '../src/lib/schema';
import { eq } from 'drizzle-orm';

async function test() {
  console.log('Testing transaction...');
  try {
    await db.transaction(async (tx) => {
      console.log('Inside transaction');
      await tx.insert(tasks).values({ name: 'Transaction Task', listId: null }).run(); // .run() is proxy method
      console.log('Inserted');
      // Rollback
      // tx.rollback(); // Drizzle transaction rollback throws error?
    });
    console.log('Transaction success');
  } catch (e) {
    console.error('Transaction failed:', e);
  }
}

test().catch(console.error);
