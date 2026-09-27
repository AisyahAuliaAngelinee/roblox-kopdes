CREATE TABLE `kopdes_orders` (
	`id` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`data` text NOT NULL,
	`status` text NOT NULL,
	`paid_at` integer,
	`invoice_id` text,
	`url` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_orders_owner_created` ON `kopdes_orders` (`owner`,`created_at`);