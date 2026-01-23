ALTER TABLE `tasks` ADD `order` integer DEFAULT 0;--> statement-breakpoint
CREATE INDEX `tasks_date_idx` ON `tasks` (`date`);