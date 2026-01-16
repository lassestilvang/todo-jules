import { z } from 'zod';

export const createTaskSchema = z.object({
  name: z.string().min(1, 'Task name is required').max(255),
  description: z.string().optional(),
  date: z.string().optional().nullable().transform((val) => val ? new Date(val) : undefined),
  listId: z.number().optional(),
  priority: z.enum(['None', 'Low', 'Medium', 'High']).optional(),
});

export const updateTaskSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional().nullable(),
  date: z.date().optional().nullable(),
  deadline: z.date().optional().nullable(),
  priority: z.enum(['None', 'Low', 'Medium', 'High']).optional(),
  completed: z.boolean().optional(),
  listId: z.number().optional().nullable(),
});

export const createListSchema = z.object({
  name: z.string().min(1, 'List name is required').max(50),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color hex code'),
  emoji: z.string().min(1, 'Emoji is required').max(2),
});
