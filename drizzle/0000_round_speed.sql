CREATE TABLE `answers` (
	`question_id` text PRIMARY KEY NOT NULL,
	`answer` text NOT NULL,
	`score` integer NOT NULL,
	`feedback` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `favorites` (
	`item_id` text PRIMARY KEY NOT NULL,
	`item_type` text NOT NULL,
	`title` text NOT NULL,
	`summary` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `progress` (
	`item_id` text PRIMARY KEY NOT NULL,
	`completed` integer DEFAULT false NOT NULL,
	`updated_at` text NOT NULL
);
