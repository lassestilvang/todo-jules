ALTER TABLE `tasks` ADD `description` text;--> statement-breakpoint
ALTER TABLE `tasks` ADD `date` integer;--> statement-breakpoint
ALTER TABLE `tasks` ADD `deadline` integer;--> statement-breakpoint
ALTER TABLE `tasks` ADD `reminders` text;--> statement-breakpoint
ALTER TABLE `tasks` ADD `estimate` integer;--> statement-breakpoint
ALTER TABLE `tasks` ADD `actual_time` integer;--> statement-breakpoint
ALTER TABLE `tasks` ADD `labels` text;--> statement-breakpoint
ALTER TABLE `tasks` ADD `priority` text DEFAULT 'None';--> statement-breakpoint
ALTER TABLE `tasks` ADD `subtasks` text;--> statement-breakpoint
ALTER TABLE `tasks` ADD `recurring` text;--> statement-breakpoint
ALTER TABLE `tasks` ADD `attachment` text;--> statement-breakpoint
ALTER TABLE `tasks` ADD `created_at` integer DEFAULT (strftime('%s', 'now'));--> statement-breakpoint
ALTER TABLE `tasks` ADD `updated_at` integer DEFAULT (strftime('%s', 'now'));