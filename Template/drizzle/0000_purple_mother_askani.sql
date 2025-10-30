CREATE TABLE `assignments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`entity_id` integer NOT NULL,
	`stakeholder_id` integer NOT NULL,
	`role_type` text NOT NULL,
	`due_date` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`assigned_at` text NOT NULL,
	`completed_at` text,
	FOREIGN KEY (`entity_id`) REFERENCES `entities`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`stakeholder_id`) REFERENCES `stakeholders`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `audit_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`action` text NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` integer NOT NULL,
	`old_value` text,
	`new_value` text,
	`ip_address` text,
	`timestamp` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `entities` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`code` text NOT NULL,
	`department` text NOT NULL,
	`region` text NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `entities_code_unique` ON `entities` (`code`);--> statement-breakpoint
CREATE TABLE `file_uploads` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`trial_report_id` integer NOT NULL,
	`file_name` text NOT NULL,
	`file_type` text NOT NULL,
	`file_url` text NOT NULL,
	`file_size` integer NOT NULL,
	`upload_status` text DEFAULT 'pending' NOT NULL,
	`validation_errors` text,
	`uploaded_at` text NOT NULL,
	FOREIGN KEY (`trial_report_id`) REFERENCES `trial_reports`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `gl_accounts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`entity_id` integer NOT NULL,
	`account_number` text NOT NULL,
	`account_name` text NOT NULL,
	`account_type` text NOT NULL,
	`current_balance` real DEFAULT 0 NOT NULL,
	`previous_balance` real DEFAULT 0 NOT NULL,
	`opening_balance` real DEFAULT 0 NOT NULL,
	`currency` text DEFAULT 'USD' NOT NULL,
	`last_updated` text NOT NULL,
	FOREIGN KEY (`entity_id`) REFERENCES `entities`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`stakeholder_id` integer NOT NULL,
	`message` text NOT NULL,
	`type` text NOT NULL,
	`read_status` integer DEFAULT false,
	`sent_at` text NOT NULL,
	`related_entity_id` integer,
	`related_report_id` integer,
	FOREIGN KEY (`stakeholder_id`) REFERENCES `stakeholders`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `stakeholders` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`role` text NOT NULL,
	`department` text NOT NULL,
	`entities` text,
	`notification_preferences` text,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `stakeholders_email_unique` ON `stakeholders` (`email`);--> statement-breakpoint
CREATE TABLE `trial_reports` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`entity_id` integer NOT NULL,
	`reporting_period` text NOT NULL,
	`report_type` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`total_debits` real DEFAULT 0 NOT NULL,
	`total_credits` real DEFAULT 0 NOT NULL,
	`balance_difference` real DEFAULT 0 NOT NULL,
	`uploaded_by` integer,
	`uploaded_at` text NOT NULL,
	`reviewed_by` integer,
	`reviewed_at` text,
	`file_url` text,
	FOREIGN KEY (`entity_id`) REFERENCES `entities`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `variance_analysis` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`trial_report_id` integer NOT NULL,
	`gl_account_id` integer NOT NULL,
	`variance_amount` real NOT NULL,
	`variance_percentage` real NOT NULL,
	`period_comparison` text NOT NULL,
	`anomaly_detected` integer DEFAULT false,
	`anomaly_reason` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`trial_report_id`) REFERENCES `trial_reports`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`gl_account_id`) REFERENCES `gl_accounts`(`id`) ON UPDATE no action ON DELETE no action
);
