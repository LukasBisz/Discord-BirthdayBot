CREATE TABLE `birthdays` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`birthday_id` text NOT NULL,
	`added_by` text NOT NULL,
	`day` integer NOT NULL,
	`month` integer NOT NULL,
	`year` integer,
	`last_displayed_at` text
);
--> statement-breakpoint
CREATE TABLE `configuration` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`guild_id` text NOT NULL,
	`channel_id` text NOT NULL,
	`setup_complete` integer DEFAULT false NOT NULL
);
