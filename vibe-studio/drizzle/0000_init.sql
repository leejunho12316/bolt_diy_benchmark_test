CREATE TABLE `chats` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text DEFAULT '새 프로젝트' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `file_snapshots` (
	`id` text PRIMARY KEY NOT NULL,
	`chat_id` text NOT NULL,
	`message_id` text,
	`files` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`chat_id`) REFERENCES `chats`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `file_snapshots_chat_idx` ON `file_snapshots` (`chat_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `messages` (
	`id` text PRIMARY KEY NOT NULL,
	`chat_id` text NOT NULL,
	`role` text NOT NULL,
	`content` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`chat_id`) REFERENCES `chats`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `messages_chat_idx` ON `messages` (`chat_id`,`created_at`);