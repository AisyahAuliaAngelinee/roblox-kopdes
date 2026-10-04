-- Initial schema for a NEW D1 database. Does not import staging records.
-- Existing databases should use the ordered drizzle migrations.
CREATE TABLE IF NOT EXISTS `kopdes_profiles` (
	`user_id` text PRIMARY KEY NOT NULL,
	`data` text NOT NULL,
	`version` integer DEFAULT 0 NOT NULL,
	`updated_at` integer NOT NULL
);

CREATE TABLE IF NOT EXISTS `kopdes_orders` (
	`id` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`data` text NOT NULL,
	`status` text NOT NULL,
	`paid_at` integer,
	`completed_at` integer,
	`invoice_id` text,
	`url` text,
	`created_at` integer NOT NULL
);

CREATE INDEX IF NOT EXISTS `idx_orders_owner_created` ON `kopdes_orders` (`owner`,`created_at`);

CREATE TABLE IF NOT EXISTS `kopdes_catalog_events` (
	`id` text PRIMARY KEY NOT NULL,
	`at` integer NOT NULL,
	`data` text NOT NULL
);

CREATE INDEX IF NOT EXISTS `idx_catalog_events_at` ON `kopdes_catalog_events` (`at`);
CREATE TABLE IF NOT EXISTS `kopdes_catalog_snapshot` (
	`id` text PRIMARY KEY NOT NULL,
	`price` integer NOT NULL,
	`stock` integer NOT NULL
);

CREATE TABLE IF NOT EXISTS `kopdes_notification_reads` (
	`owner` text PRIMARY KEY NOT NULL,
	`read_at` integer NOT NULL
);

CREATE TABLE IF NOT EXISTS `kopdes_admin_invites` (
	`hash` text PRIMARY KEY NOT NULL,
	`expires_at` integer NOT NULL,
	`used_by` text,
	`created_by` text NOT NULL
);

CREATE TABLE IF NOT EXISTS `kopdes_admin_limits` (
	`id` text PRIMARY KEY NOT NULL,
	`count` integer NOT NULL,
	`until` integer NOT NULL
);

CREATE TABLE IF NOT EXISTS `kopdes_admin_sessions` (
	`hash` text PRIMARY KEY NOT NULL,
	`admin_id` text NOT NULL,
	`expires_at` integer NOT NULL
);

CREATE TABLE IF NOT EXISTS `kopdes_admins` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`name` text NOT NULL,
	`password` text NOT NULL,
	`created_at` integer NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS `kopdes_admins_email_unique` ON `kopdes_admins` (`email`);
CREATE TABLE IF NOT EXISTS `kopdes_content` (
	`id` text PRIMARY KEY NOT NULL,
	`data` text NOT NULL,
	`version` integer DEFAULT 0 NOT NULL
);

CREATE TABLE IF NOT EXISTS `kopdes_products` (
	`id` text PRIMARY KEY NOT NULL,
	`data` text NOT NULL,
	`version` integer DEFAULT 0 NOT NULL,
	`updated_at` integer NOT NULL
);

