import { updateTask, createTask } from './src/app/actions/task';

async function run() {
  const newTask = await createTask({ name: 'task', subtasks: [{ name: 'subtask 1' }] } as any);
  console.log(newTask);
  const res = await updateTask(newTask.data.id, { subtasks: [{ name: 'test' }] } as any);
  console.log(res);
}

run();
