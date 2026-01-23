ALTER TABLE `tasks` ADD `order` integer DEFAULT 0;--> statement-breakpoint
CREATE INDEX `tasks_list_id_idx` ON `tasks` (`list_id`);