CREATE TABLE `daily_progress` (
	`id` text PRIMARY KEY NOT NULL,
	`learning_date` text NOT NULL,
	`item_id` text NOT NULL,
	`task_type` text NOT NULL,
	`completed` integer DEFAULT false NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_daily_progress_date_item` ON `daily_progress` (`learning_date`,`item_id`);--> statement-breakpoint
CREATE INDEX `idx_daily_progress_date_completed` ON `daily_progress` (`learning_date`,`completed`);