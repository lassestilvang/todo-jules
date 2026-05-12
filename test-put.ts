import { updateTaskSchema } from './src/lib/validators';

const res = updateTaskSchema.safeParse({ date: '2023-01-01T00:00:00.000Z' });
console.log(res);
