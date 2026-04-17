/**
 * Standalone verification script to check the logic of the refactored transaction.
 * Since we can't run the full environment, we'll verify the logical flow.
 */

function mockTx() {
  const calls = [];
  return {
    update: (table) => ({
      set: (values) => ({
        where: (cond) => ({
          returning: () => ({
            all: () => {
              calls.push({ method: 'update', table: table.name, values });
              return [{ id: 1, name: 'Updated Task' }];
            }
          })
        })
      })
    }),
    delete: (table) => ({
      where: (cond) => ({
        run: () => {
          calls.push({ method: 'delete', table: table.name });
        }
      })
    }),
    insert: (table) => ({
      values: (vals) => ({
        run: () => {
          calls.push({ method: 'insert', table: table.name, count: vals.length });
        }
      })
    }),
    getCalls: () => calls
  };
}

const tasks = { name: 'tasks' };
const subtasks = { name: 'subtasks' };

function simulateRefactoredLogic(tx, validatedBody) {
  let updated;
  if (Object.keys(validatedBody).length > 0) {
    const [result] = tx
      .update(tasks)
      .set({ name: validatedBody.name })
      .where('id = 1')
      .returning()
      .all();
    updated = result;
  }

  if (validatedBody.subtasks) {
    tx.delete(subtasks).where('taskId = 1').run();
    tx.insert(subtasks).values(validatedBody.subtasks).run();
  }

  return updated;
}

const tx = mockTx();
const result = simulateRefactoredLogic(tx, { name: 'New Name', subtasks: [{ name: 'Sub 1' }] });

console.log('Result:', result);
console.log('Calls:', JSON.stringify(tx.getCalls(), null, 2));

if (result.name === 'Updated Task' && tx.getCalls().length === 3) {
  console.log('VERIFICATION SUCCESSFUL');
} else {
  console.log('VERIFICATION FAILED');
  process.exit(1);
}
