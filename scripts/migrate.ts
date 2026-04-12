import Database from 'better-sqlite3';
import * as fs from 'fs';
import * as path from 'path';

const sqlite = new Database('sqlite.db');

async function main() {
  console.log('Running migration...');

  // 1. Apply the first migration to create the new tables
  const migration1 = fs.readFileSync(path.join('drizzle', '0002_yielding_thor.sql'), 'utf-8');
  sqlite.exec(migration1);
  console.log('Applied first migration.');

  // 2. Transfer data from JSON columns to new tables
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tasksWithOldSchema = sqlite.prepare('SELECT * FROM tasks').all() as any[];

  const insertSubtask = sqlite.prepare('INSERT INTO subtasks (name, completed, task_id) VALUES (?, ?, ?)');
  const selectLabel = sqlite.prepare('SELECT id FROM labels WHERE name = ?');
  const insertLabel = sqlite.prepare('INSERT INTO labels (name, color, icon) VALUES (?, ?, ?)');
  const insertTaskLabel = sqlite.prepare('INSERT INTO task_labels (task_id, label_id) VALUES (?, ?)');
  const insertReminder = sqlite.prepare('INSERT INTO reminders (remind_at, task_id) VALUES (?, ?)');
  const insertAttachment = sqlite.prepare('INSERT INTO attachments (url, task_id) VALUES (?, ?)');

  const labelCache = new Map<string, number | bigint>();

  const transferData = sqlite.transaction(() => {
    for (const task of tasksWithOldSchema) {
      if (task.subtasks) {
        const parsedSubtasks = JSON.parse(task.subtasks);
        for (const subtask of parsedSubtasks) {
          insertSubtask.run(subtask.name, subtask.completed, task.id);
        }
      }
      if (task.labels) {
        const parsedLabels = JSON.parse(task.labels);
        for (const label of parsedLabels) {
          let labelId = labelCache.get(label.name);
          if (!labelId) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const existingLabel = selectLabel.get(label.name) as any;
            if (existingLabel) {
              labelId = existingLabel.id;
            } else {
              const result = insertLabel.run(label.name, label.color, label.icon);
              labelId = result.lastInsertRowid;
            }
            if (labelId !== undefined) { labelCache.set(label.name, labelId); }
          }
          insertTaskLabel.run(task.id, labelId);
        }
      }
      if (task.reminders) {
        const parsedReminders = JSON.parse(task.reminders);
        for (const reminder of parsedReminders) {
          insertReminder.run(reminder.remindAt, task.id);
        }
      }
      if (task.attachment) {
        insertAttachment.run(task.attachment, task.id);
      }
    }
  });

  transferData();
  console.log('Data transfer complete.');

  // 3. Apply the second migration to drop the old columns
  const migration2 = fs.readFileSync(path.join('drizzle', '0003_good_the_fury.sql'), 'utf-8');
  sqlite.exec(migration2);
  console.log('Applied second migration.');

  console.log('Migration complete.');
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
