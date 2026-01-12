import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const lists = sqliteTable('lists', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  color: text('color').notNull(),
  emoji: text('emoji').notNull(),
});

export const tasks = sqliteTable('tasks', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  description: text('description'),
  date: integer('date', { mode: 'timestamp' }),
  deadline: integer('deadline', { mode: 'timestamp' }),
  reminders: text('reminders'), // JSON string for reminders
  estimate: integer('estimate'), // in minutes
  actualTime: integer('actual_time'), // in minutes
  labels: text('labels'), // JSON string for labels
  priority: text('priority').default('None'),
  subtasks: text('subtasks'), // JSON string for subtasks
  recurring: text('recurring'),
  attachment: text('attachment'),
  completed: integer('completed', { mode: 'boolean' }).default(false),
  listId: integer('list_id').references(() => lists.id),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(
    sql`(strftime('%s', 'now'))`
  ),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(
    sql`(strftime('%s', 'now'))`
  ),
});
