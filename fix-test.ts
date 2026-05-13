import { updateTask, createTask } from './src/app/actions/task';
// mock `after` to just call the fn
import * as nextServer from 'next/server';
(nextServer as any).after = (fn: any) => fn();

async function run() {
  const newTask = await createTask({ name: 'task', subtasks: [{ name: 'subtask 1' }] } as any);
  console.log(newTask);
  const res = await updateTask(newTask.data.id, { subtasks: [{ name: 'test' }] } as any);
  console.log(res);
}

run();
