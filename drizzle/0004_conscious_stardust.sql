CREATE TABLE `sync_operations` (
	`operation_id` text PRIMARY KEY NOT NULL,
	`operation_type` text NOT NULL,
	`entity_id` text NOT NULL,
	`client_updated_at` text NOT NULL,
	`applied_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_sync_operations_applied_at` ON `sync_operations` (`applied_at`);
--> statement-breakpoint
PRAGMA optimize;
