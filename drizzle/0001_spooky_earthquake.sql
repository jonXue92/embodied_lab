CREATE TABLE `qa_conversations` (
	`id` text PRIMARY KEY NOT NULL,
	`question` text NOT NULL,
	`answer` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_qa_created_at` ON `qa_conversations` (`created_at`);