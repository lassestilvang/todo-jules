import { z } from 'zod';

const updateTaskSchema = z.object({
  date: z.union([z.string().max(100, 'Date string is too long').transform((val) => val ? new Date(val) : undefined).refine((d) => !d || !isNaN(d.getTime()), 'Invalid date'), z.date()]).optional().nullable(),
});

console.log(updateTaskSchema.safeParse({ date: '2023-01-01T00:00:00.000Z' }));
