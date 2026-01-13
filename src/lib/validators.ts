import { z } from 'zod';

export const createTaskSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  date: z.string().optional(),
  deadline: z.string().optional(),
  estimate: z.number().optional(),
  actualTime: z.number().optional(),
  priority: z.string().optional(),
  recurring: z.string().optional(),
  listId: z.number(),
  subtasks: z.array(z.object({ name: z.string(), completed: z.boolean() })).optional(),
  labels: z.array(z.number()).optional(),
  reminders: z.array(z.object({ remindAt: z.string() })).optional(),
  attachments: z.array(z.object({ url: z.string() })).optional(),
});

export const updateTaskSchema = createTaskSchema.partial();
