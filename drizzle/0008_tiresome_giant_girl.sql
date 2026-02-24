CREATE INDEX `attachments_task_id_idx` ON `attachments` (`task_id`);--> statement-breakpoint
CREATE INDEX `reminders_task_id_idx` ON `reminders` (`task_id`);--> statement-breakpoint
CREATE INDEX `subtasks_task_id_idx` ON `subtasks` (`task_id`);--> statement-breakpoint
CREATE INDEX `task_history_task_id_idx` ON `task_history` (`task_id`);--> statement-breakpoint
CREATE INDEX `task_labels_task_id_idx` ON `task_labels` (`task_id`);--> statement-breakpoint
CREATE INDEX `task_labels_label_id_idx` ON `task_labels` (`label_id`);--> statement-breakpoint
CREATE INDEX `tasks_inbox_idx` ON `tasks` (`list_id`,`created_at`);