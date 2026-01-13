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
  estimate: integer('estimate'), // in minutes
  actualTime: integer('actual_time'), // in minutes
  priority: text('priority').default('None'),
  recurring: text('recurring'),
  completed: integer('completed', { mode: 'boolean' }).default(false),
  listId: integer('list_id').references(() => lists.id),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(
    sql`(strftime('%s', 'now'))`
  ),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(
    sql`(strftime('%s', 'now'))`
  ),
});

export const subtasks = sqliteTable('subtasks', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  completed: integer('completed', { mode: 'boolean' }).default(false),
  taskId: integer('task_id').references(() => tasks.id, { onDelete: 'cascade' }),
});

export const labels = sqliteTable('labels', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  color: text('color'),
  icon: text('icon'),
});

export const taskLabels = sqliteTable('task_labels', {
  taskId: integer('task_id').references(() => tasks.id, { onDelete: 'cascade' }),
  labelId: integer('label_id').references(() => labels.id, { onDelete: 'cascade' }),
});

export const reminders = sqliteTable('reminders', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  remindAt: integer('remind_at', { mode: 'timestamp' }).notNull(),
  taskId: integer('task_id').references(() => tasks.id, { onDelete: 'cascade' }),
});

export const attachments = sqliteTable('attachments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  url: text('url').notNull(),
  taskId: integer('task_id').references(() => tasks.id, { onDelete: 'cascade' }),
});
