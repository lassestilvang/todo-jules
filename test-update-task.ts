import { updateTask } from './src/app/actions/task';

async function run() {
  const res = await updateTask(1, { subtasks: [{ name: 'test' }] } as any);
  console.log(res);
}

run();
