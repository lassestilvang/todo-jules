import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
import { sql, relations } from 'drizzle-orm';

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
  order: integer('order').default(0),
  listId: integer('list_id').references(() => lists.id),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(
    sql`(strftime('%s', 'now'))`
  ),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(
    sql`(strftime('%s', 'now'))`
  ),
}, (table) => {
  return {
    dateIdx: index('tasks_date_idx').on(table.date),
    listIdIdx: index('tasks_list_id_idx').on(table.listId),
    nameIdx: index('tasks_name_idx').on(sql`${table.name} COLLATE NOCASE`),
    descriptionIdx: index('tasks_description_idx').on(sql`${table.description} COLLATE NOCASE`),
  }
});

export const subtasks = sqliteTable('subtasks', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  completed: integer('completed', { mode: 'boolean' }).default(false),
  taskId: integer('task_id').references(() => tasks.id, { onDelete: 'cascade' }),
}, (table) => {
  return {
    // Index on taskId for faster lookups (verified 0.29ms vs 3.13ms without)
    taskIdIdx: index('subtasks_task_id_idx').on(table.taskId),
  }
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
}, (table) => {
  return {
    taskIdIdx: index('task_labels_task_id_idx').on(table.taskId),
    labelIdIdx: index('task_labels_label_id_idx').on(table.labelId),
  }
});

export const reminders = sqliteTable('reminders', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  remindAt: integer('remind_at', { mode: 'timestamp' }).notNull(),
  taskId: integer('task_id').references(() => tasks.id, { onDelete: 'cascade' }),
}, (table) => {
  return {
    taskIdIdx: index('reminders_task_id_idx').on(table.taskId),
  }
});

export const attachments = sqliteTable('attachments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  url: text('url').notNull(),
  taskId: integer('task_id').references(() => tasks.id, { onDelete: 'cascade' }),
}, (table) => {
  return {
    taskIdIdx: index('attachments_task_id_idx').on(table.taskId),
  }
});

export const taskHistory = sqliteTable('task_history', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  taskId: integer('task_id')
    .references(() => tasks.id, { onDelete: 'cascade' })
    .notNull(),
  changedField: text('changed_field').notNull(),
  oldValue: text('old_value'),
  newValue: text('new_value'),
  changedAt: integer('changed_at', { mode: 'timestamp' })
    .default(sql`(strftime('%s', 'now'))`)
    .notNull(),
}, (table) => {
  return {
    taskIdIdx: index('task_history_task_id_idx').on(table.taskId),
  }
});

export const listRelations = relations(lists, ({ many }) => ({
  tasks: many(tasks),
}));

export const taskRelations = relations(tasks, ({ one, many }) => ({
  list: one(lists, {
    fields: [tasks.listId],
    references: [lists.id],
  }),
  subtasks: many(subtasks),
  labels: many(taskLabels),
  reminders: many(reminders),
  attachments: many(attachments),
  history: many(taskHistory),
}));

export const subtaskRelations = relations(subtasks, ({ one }) => ({
  task: one(tasks, {
    fields: [subtasks.taskId],
    references: [tasks.id],
  }),
}));

export const labelRelations = relations(labels, ({ many }) => ({
  taskLabels: many(taskLabels),
}));

export const taskLabelRelations = relations(taskLabels, ({ one }) => ({
  task: one(tasks, {
    fields: [taskLabels.taskId],
    references: [tasks.id],
  }),
  label: one(labels, {
    fields: [taskLabels.labelId],
    references: [labels.id],
  }),
}));

export const reminderRelations = relations(reminders, ({ one }) => ({
  task: one(tasks, {
    fields: [reminders.taskId],
    references: [tasks.id],
  }),
}));

export const attachmentRelations = relations(attachments, ({ one }) => ({
  task: one(tasks, {
    fields: [attachments.taskId],
    references: [tasks.id],
  }),
}));

export const taskHistoryRelations = relations(taskHistory, ({ one }) => ({
  task: one(tasks, {
    fields: [taskHistory.taskId],
    references: [tasks.id],
  }),
}));
