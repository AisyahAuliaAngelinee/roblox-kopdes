CREATE TABLE `kopdes_admin_invites` (
	`hash` text PRIMARY KEY NOT NULL,
	`expires_at` integer NOT NULL,
	`used_by` text,
	`created_by` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `kopdes_admin_limits` (
	`id` text PRIMARY KEY NOT NULL,
	`count` integer NOT NULL,
	`until` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `kopdes_admin_sessions` (
	`hash` text PRIMARY KEY NOT NULL,
	`admin_id` text NOT NULL,
	`expires_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `kopdes_admins` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`name` text NOT NULL,
	`password` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `kopdes_admins_email_unique` ON `kopdes_admins` (`email`);--> statement-breakpoint
CREATE TABLE `kopdes_content` (
	`id` text PRIMARY KEY NOT NULL,
	`data` text NOT NULL,
	`version` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `kopdes_products` (
	`id` text PRIMARY KEY NOT NULL,
	`data` text NOT NULL,
	`version` integer DEFAULT 0 NOT NULL,
	`updated_at` integer NOT NULL
);
