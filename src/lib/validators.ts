import { z } from 'zod';

export const createTaskSchema = z.object({
  name: z.string().min(1, 'Task name is required').max(255),
  description: z.string().optional(),
  date: z.union([z.string().transform((val) => val ? new Date(val) : undefined), z.date()]).optional().nullable(),
  deadline: z.union([z.string().transform((val) => val ? new Date(val) : undefined), z.date()]).optional().nullable(),
  listId: z.number().optional(),
  priority: z.enum(['None', 'Low', 'Medium', 'High']).optional(),
  estimate: z.number().optional(),
  actualTime: z.number().optional(),
  recurring: z.string().optional(),
  subtasks: z.array(z.object({
    name: z.string(),
    completed: z.boolean().optional(),
  })).optional(),
  labels: z.array(z.number()).optional(),
  reminders: z.array(z.object({
    remindAt: z.date(),
  })).optional(),
  attachments: z.array(z.object({
    url: z.string(),
  })).optional(),
});

export const updateTaskSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional().nullable(),
  date: z.date().optional().nullable(),
  deadline: z.date().optional().nullable(),
  priority: z.enum(['None', 'Low', 'Medium', 'High']).optional(),
  completed: z.boolean().optional(),
  listId: z.number().optional().nullable(),
  subtasks: z.array(z.object({
    name: z.string(),
    completed: z.boolean().optional(),
  })).optional(),
  labels: z.array(z.number()).optional(),
  reminders: z.array(z.object({
    remindAt: z.date(),
  })).optional(),
  attachments: z.array(z.object({
    url: z.string(),
  })).optional(),
});

export const createListSchema = z.object({
  name: z.string().min(1, 'List name is required').max(50),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color hex code'),
  emoji: z.string().min(1, 'Emoji is required').max(2),
});
