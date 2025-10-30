import { sqliteTable, integer, text, real } from 'drizzle-orm/sqlite-core';

// Entities table - manages 1,000+ entities
export const entities = sqliteTable('entities', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  code: text('code').notNull().unique(),
  department: text('department').notNull(),
  region: text('region').notNull(),
  status: text('status').notNull().default('active'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// GL Accounts table - general ledger accounts for each entity
export const glAccounts = sqliteTable('gl_accounts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  entityId: integer('entity_id').notNull().references(() => entities.id),
  accountNumber: text('account_number').notNull(),
  accountName: text('account_name').notNull(),
  accountType: text('account_type').notNull(),
  currentBalance: real('current_balance').notNull().default(0),
  previousBalance: real('previous_balance').notNull().default(0),
  openingBalance: real('opening_balance').notNull().default(0),
  currency: text('currency').notNull().default('USD'),
  lastUpdated: text('last_updated').notNull(),
});

// Trial Reports table - trial balance reports
export const trialReports = sqliteTable('trial_reports', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  entityId: integer('entity_id').notNull().references(() => entities.id),
  reportingPeriod: text('reporting_period').notNull(),
  reportType: text('report_type').notNull(),
  status: text('status').notNull().default('pending'),
  totalDebits: real('total_debits').notNull().default(0),
  totalCredits: real('total_credits').notNull().default(0),
  balanceDifference: real('balance_difference').notNull().default(0),
  uploadedBy: integer('uploaded_by'),
  uploadedAt: text('uploaded_at').notNull(),
  reviewedBy: integer('reviewed_by'),
  reviewedAt: text('reviewed_at'),
  fileUrl: text('file_url'),
});

// Stakeholders table - users with different roles
export const stakeholders = sqliteTable('stakeholders', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  role: text('role').notNull(),
  department: text('department').notNull(),
  entities: text('entities', { mode: 'json' }),
  notificationPreferences: text('notification_preferences', { mode: 'json' }),
  createdAt: text('created_at').notNull(),
});

// Assignments table - assign stakeholders to entity tasks
export const assignments = sqliteTable('assignments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  entityId: integer('entity_id').notNull().references(() => entities.id),
  stakeholderId: integer('stakeholder_id').notNull().references(() => stakeholders.id),
  roleType: text('role_type').notNull(),
  dueDate: text('due_date').notNull(),
  status: text('status').notNull().default('pending'),
  assignedAt: text('assigned_at').notNull(),
  completedAt: text('completed_at'),
});

// File Uploads table - track uploaded files
export const fileUploads = sqliteTable('file_uploads', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  trialReportId: integer('trial_report_id').notNull().references(() => trialReports.id),
  fileName: text('file_name').notNull(),
  fileType: text('file_type').notNull(),
  fileUrl: text('file_url').notNull(),
  fileSize: integer('file_size').notNull(),
  uploadStatus: text('upload_status').notNull().default('pending'),
  validationErrors: text('validation_errors', { mode: 'json' }),
  uploadedAt: text('uploaded_at').notNull(),
});

// Variance Analysis table - track period-over-period variances
export const varianceAnalysis = sqliteTable('variance_analysis', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  trialReportId: integer('trial_report_id').notNull().references(() => trialReports.id),
  glAccountId: integer('gl_account_id').notNull().references(() => glAccounts.id),
  varianceAmount: real('variance_amount').notNull(),
  variancePercentage: real('variance_percentage').notNull(),
  periodComparison: text('period_comparison').notNull(),
  anomalyDetected: integer('anomaly_detected', { mode: 'boolean' }).default(false),
  anomalyReason: text('anomaly_reason'),
  createdAt: text('created_at').notNull(),
});

// Notifications table - system notifications
export const notifications = sqliteTable('notifications', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  stakeholderId: integer('stakeholder_id').notNull().references(() => stakeholders.id),
  message: text('message').notNull(),
  type: text('type').notNull(),
  readStatus: integer('read_status', { mode: 'boolean' }).default(false),
  sentAt: text('sent_at').notNull(),
  relatedEntityId: integer('related_entity_id'),
  relatedReportId: integer('related_report_id'),
});

// Audit Logs table - track all system changes
export const auditLogs = sqliteTable('audit_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull(),
  action: text('action').notNull(),
  entityType: text('entity_type').notNull(),
  entityId: integer('entity_id').notNull(),
  oldValue: text('old_value', { mode: 'json' }),
  newValue: text('new_value', { mode: 'json' }),
  ipAddress: text('ip_address'),
  timestamp: text('timestamp').notNull(),
});