CREATE TABLE `learning_answers` (
	`id` text PRIMARY KEY NOT NULL,
	`question_id` text NOT NULL,
	`question_title` text NOT NULL,
	`item_type` text NOT NULL,
	`answer` text NOT NULL,
	`score` integer NOT NULL,
	`feedback` text NOT NULL,
	`reference` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_learning_answers_created_at` ON `learning_answers` (`created_at`);--> statement-breakpoint
CREATE TABLE `notes` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`content` text NOT NULL,
	`context` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_notes_updated_at` ON `notes` (`updated_at`);