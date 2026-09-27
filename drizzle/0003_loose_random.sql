CREATE TABLE `kopdes_catalog_events` (
	`id` text PRIMARY KEY NOT NULL,
	`at` integer NOT NULL,
	`data` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_catalog_events_at` ON `kopdes_catalog_events` (`at`);--> statement-breakpoint
CREATE TABLE `kopdes_catalog_snapshot` (
	`id` text PRIMARY KEY NOT NULL,
	`price` integer NOT NULL,
	`stock` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `kopdes_notification_reads` (
	`owner` text PRIMARY KEY NOT NULL,
	`read_at` integer NOT NULL
);
