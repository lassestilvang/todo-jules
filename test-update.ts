import { db } from './src/lib/db';
import { updateTask, createTask } from './src/app/actions/task';
import { tasks } from './src/lib/schema';

async function run() {
  const newTask = await createTask({ name: 'task' } as any);
  console.log('newTask id:', newTask.data?.id);
  const res = await updateTask(newTask.data?.id as number, {} as any);
  console.log(res);
}

run();
