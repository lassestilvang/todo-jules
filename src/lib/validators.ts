import { z } from 'zod';

export const createTaskSchema = z.object({
  name: z.string().min(1, 'Task name is required').max(255),
  description: z.string().max(10000, 'Description is too long').optional(),
  date: z.union([z.string().transform((val) => val ? new Date(val) : undefined), z.date()]).optional().nullable(),
  deadline: z.union([z.string().transform((val) => val ? new Date(val) : undefined), z.date()]).optional().nullable(),
  listId: z.number().optional(),
  priority: z.enum(['None', 'Low', 'Medium', 'High']).optional(),
  estimate: z.number().optional(),
  actualTime: z.number().optional(),
  recurring: z.string().max(255).optional(),
  subtasks: z.array(z.object({
    id: z.number().optional(),
    name: z.string().max(255, 'Subtask name is too long'),
    completed: z.boolean().optional(),
  })).max(100, 'Too many subtasks').optional(),
  labels: z.array(z.number()).max(50, 'Too many labels').optional(),
  reminders: z.array(z.object({
    remindAt: z.date(),
  })).max(50, 'Too many reminders').optional(),
  attachments: z.array(z.object({
    url: z.string().url('Invalid URL').regex(/^https?:\/\//i, 'URL must start with http:// or https://').max(2048, 'URL is too long'),
  })).max(50, 'Too many attachments').optional(),
});

export const updateTaskSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().max(10000, 'Description is too long').optional().nullable(),
  date: z.date().optional().nullable(),
  deadline: z.date().optional().nullable(),
  priority: z.enum(['None', 'Low', 'Medium', 'High']).optional(),
  completed: z.boolean().optional(),
  listId: z.number().optional().nullable(),
  subtasks: z.array(z.object({
    id: z.number().optional(),
    name: z.string().max(255, 'Subtask name is too long'),
    completed: z.boolean().optional(),
  })).max(100, 'Too many subtasks').optional(),
  labels: z.array(z.number()).max(50, 'Too many labels').optional(),
  reminders: z.array(z.object({
    remindAt: z.date(),
  })).max(50, 'Too many reminders').optional(),
  attachments: z.array(z.object({
    url: z.string().url('Invalid URL').regex(/^https?:\/\//i, 'URL must start with http:// or https://').max(2048, 'URL is too long'),
  })).max(50, 'Too many attachments').optional(),
});

export const createListSchema = z.object({
  name: z.string().min(1, 'List name is required').max(50),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color hex code'),
  emoji: z.string().min(1, 'Emoji is required').max(2),
});
