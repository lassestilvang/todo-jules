import Database from 'better-sqlite3';

function run() {
  const dbPath = 'benchmark_migration_actual.db';
  const sqlite = new Database(dbPath);

  // Setup tables
  sqlite.exec(`
    CREATE TABLE tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      subtasks TEXT,
      labels TEXT,
      reminders TEXT,
      attachment TEXT
    );
    CREATE TABLE subtasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      completed INTEGER,
      task_id INTEGER
    );
    CREATE TABLE labels (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      color TEXT,
      icon TEXT
    );
    CREATE TABLE task_labels (
      task_id INTEGER,
      label_id INTEGER
    );
    CREATE TABLE reminders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      remind_at TEXT,
      task_id INTEGER
    );
    CREATE TABLE attachments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      url TEXT,
      task_id INTEGER
    );
  `);

  // Seed data
  console.log('Seeding data...');
  const insertTask = sqlite.prepare('INSERT INTO tasks (subtasks, labels, reminders, attachment) VALUES (?, ?, ?, ?)');

  sqlite.transaction(() => {
    for (let i = 0; i < 5000; i++) {
      insertTask.run(
        JSON.stringify([{name: 'sub1', completed: 0}, {name: 'sub2', completed: 1}]),
        JSON.stringify([{name: 'label1', color: 'red', icon: 'icon'}, {name: 'label2', color: 'blue', icon: 'icon'}]),
        JSON.stringify([{remindAt: '2023-01-01'}, {remindAt: '2023-01-02'}]),
        'http://example.com/file'
      );
    }
  })();
  console.log('Seed complete.');

  const tasksWithOldSchema = sqlite.prepare('SELECT * FROM tasks').all() as any[];

  console.log('Running unoptimized code...');
  const startUnoptimized = performance.now();

  // UNOPTIMIZED LOOP
  sqlite.transaction(() => {
    for (const task of tasksWithOldSchema) {
      if (task.subtasks) {
        const parsedSubtasks = JSON.parse(task.subtasks);
        for (const subtask of parsedSubtasks) {
          sqlite.prepare('INSERT INTO subtasks (name, completed, task_id) VALUES (?, ?, ?)').run(subtask.name, subtask.completed ? 1 : 0, task.id);
        }
      }
      if (task.labels) {
        const parsedLabels = JSON.parse(task.labels);
        for (const label of parsedLabels) {
          let labelId;
          const existingLabel = sqlite.prepare('SELECT id FROM labels WHERE name = ?').get(label.name) as { id: number | bigint } | undefined;
          if (existingLabel) {
            labelId = existingLabel.id;
          } else {
            const result = sqlite.prepare('INSERT INTO labels (name, color, icon) VALUES (?, ?, ?)').run(label.name, label.color, label.icon);
            labelId = result.lastInsertRowid;
          }
          sqlite.prepare('INSERT INTO task_labels (task_id, label_id) VALUES (?, ?)').run(task.id, labelId);
        }
      }
      if (task.reminders) {
        const parsedReminders = JSON.parse(task.reminders);
        for (const reminder of parsedReminders) {
          sqlite.prepare('INSERT INTO reminders (remind_at, task_id) VALUES (?, ?)').run(reminder.remindAt, task.id);
        }
      }
      if (task.attachment) {
        sqlite.prepare('INSERT INTO attachments (url, task_id) VALUES (?, ?)').run(task.attachment, task.id);
      }
    }
  })();

  const endUnoptimized = performance.now();
  const unoptimizedTime = (endUnoptimized - startUnoptimized).toFixed(2);
  console.log(`Unoptimized execution time: ${unoptimizedTime} ms`);

  // Clear data for optimized run
  sqlite.exec(`
    DELETE FROM subtasks;
    DELETE FROM labels;
    DELETE FROM task_labels;
    DELETE FROM reminders;
    DELETE FROM attachments;
  `);

  console.log('Running optimized code...');
  const startOptimized = performance.now();

  // OPTIMIZED LOOP
  const insertSubtask = sqlite.prepare('INSERT INTO subtasks (name, completed, task_id) VALUES (?, ?, ?)');
  const selectLabel = sqlite.prepare('SELECT id FROM labels WHERE name = ?');
  const insertLabel = sqlite.prepare('INSERT INTO labels (name, color, icon) VALUES (?, ?, ?)');
  const insertTaskLabel = sqlite.prepare('INSERT INTO task_labels (task_id, label_id) VALUES (?, ?)');
  const insertReminder = sqlite.prepare('INSERT INTO reminders (remind_at, task_id) VALUES (?, ?)');
  const insertAttachment = sqlite.prepare('INSERT INTO attachments (url, task_id) VALUES (?, ?)');

  const labelCache = new Map<string, number | bigint>();

  sqlite.transaction(() => {
    for (const task of tasksWithOldSchema) {
      if (task.subtasks) {
        const parsedSubtasks = JSON.parse(task.subtasks);
        for (const subtask of parsedSubtasks) {
          insertSubtask.run(subtask.name, subtask.completed ? 1 : 0, task.id);
        }
      }
      if (task.labels) {
        const parsedLabels = JSON.parse(task.labels);
        for (const label of parsedLabels) {
          let labelId = labelCache.get(label.name);
          if (!labelId) {
            const existingLabel = selectLabel.get(label.name) as any;
            if (existingLabel) {
              labelId = existingLabel.id;
            } else {
              const result = insertLabel.run(label.name, label.color, label.icon);
              labelId = result.lastInsertRowid;
            }
            labelCache.set(label.name, labelId);
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
  })();

  const endOptimized = performance.now();
  const optimizedTime = (endOptimized - startOptimized).toFixed(2);
  console.log(`Optimized execution time: ${optimizedTime} ms`);
  console.log(`Improvement: ${(parseFloat(unoptimizedTime) / parseFloat(optimizedTime)).toFixed(2)}x faster`);

  // cleanup
  sqlite.close();
  require('fs').unlinkSync(dbPath);
}

run();
