import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const lists = sqliteTable('lists', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  color: text('color').notNull(),
  emoji: text('emoji').notNull(),
});

export const tasks = sqliteTable('tasks', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  listId: integer('list_id').references(() => lists.id),
  completed: integer('completed', { mode: 'boolean' }).default(false),
});
