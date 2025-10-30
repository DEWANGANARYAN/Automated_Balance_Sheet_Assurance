# Balance Sheet Assurance Agent

**AI-Powered Financial Statement Review System for 1,000+ Entities**

A comprehensive enterprise-grade platform for automating the end-to-end lifecycle of financial statement reviews, including data ingestion, validation, variance analysis, compliance checks, and intelligent reporting.

## 🚀 Features

### 1. **Data Ingestion & Validation**
- **Multi-format Support**: Upload CSV, Excel (XLS/XLSX) files
- **SAP Integration**: Parse SAP-formatted trial balance exports
- **Drag-and-Drop Interface**: User-friendly file upload with validation
- **Real-time Validation**: Automatic trial balance checking (debits = credits)
- **Batch Processing**: Handle multiple entities simultaneously

### 2. **GL Account Management**
- Manage 1,000+ entities across 5 departments and 5 regions
- Track GL accounts with current, previous, and opening balances
- Multi-currency support
- Entity filtering by department, region, and status
- Advanced search capabilities

### 3. **Trial Report Lifecycle**
- **Status Tracking**: Pending → In Review → Approved/Rejected
- **Maker-Checker Workflow**: Multi-level approval process
- **Automated Notifications**: Email and in-app alerts
- **File Attachments**: Link supporting documents to reports
- **Historical Tracking**: Complete audit trail of all changes

### 4. **AI-Powered Variance Analysis**
- **Period Comparisons**: Month-over-Month (MoM), Quarter-over-Quarter (QoQ), Year-over-Year (YoY)
- **Anomaly Detection**: ML-powered identification of unusual patterns
- **Visual Analytics**: Interactive charts and graphs using Recharts
- **Critical Alerts**: Automated flagging of variances exceeding thresholds
- **Root Cause Analysis**: AI-generated explanations for anomalies

### 5. **Interactive Dashboard**
- **Real-time Statistics**: Live metrics for entities, reports, assignments
- **Drill-down Capabilities**: Filter by entity, department, region
- **Status Monitoring**: Track pending reviews, overdue items, compliance
- **Performance Indicators**: GL hygiene status, approval rates
- **Customizable Views**: Tabbed interface for different workflows

### 6. **Conversational AI Interface**
- **Natural Language Queries**: Ask questions in plain English
- **Financial Insights**: Get instant answers about data, variances, compliance
- **Contextual Responses**: AI understands financial terminology
- **Real-time Analysis**: Query across all entities and time periods
- **Proactive Alerts**: AI suggests areas requiring attention

### 7. **Stakeholder Portal**
- **Role-Based Access**: Maker, Checker, Approver, Admin roles
- **Assignment Management**: Track tasks by entity and stakeholder
- **Workload Distribution**: View and balance team assignments
- **Due Date Tracking**: Automated overdue alerts
- **Performance Metrics**: Individual and team productivity stats

### 8. **Notification System**
- **Multi-channel Alerts**: Email, in-app, SMS notifications
- **Custom Preferences**: Configure notification settings per user
- **Smart Routing**: Automated notifications based on workflow status
- **Read/Unread Tracking**: Manage notification inbox
- **Critical Escalations**: Urgent alerts for compliance issues

### 9. **Compliance & Audit**
- **Audit Trail**: Complete log of all system actions
- **Compliance Dashboard**: Track adherence to financial policies
- **Balance Validation**: Automatic checking of trial balance rules
- **Supporting Documentation**: Link and verify backup files
- **Regulatory Reporting**: Export compliance reports

## 🏗️ Architecture

### Technology Stack
- **Framework**: Next.js 15 (App Router)
- **UI Components**: Shadcn/UI + Radix UI
- **Styling**: Tailwind CSS v4
- **Database**: Turso (LibSQL)
- **ORM**: Drizzle ORM
- **Charts**: Recharts
- **File Processing**: PapaParse (CSV), XLSX (Excel)
- **Icons**: Lucide React

### Database Schema

#### Core Tables
1. **entities** - Entity master data (50+ records)
2. **glAccounts** - GL account details (150+ accounts)
3. **trialReports** - Trial balance submissions (30+ reports)
4. **stakeholders** - User management (20 stakeholders)
5. **assignments** - Task assignments (40+ assignments)
6. **varianceAnalysis** - Variance tracking (50+ records)
7. **notifications** - Alert system (30+ notifications)
8. **auditLogs** - Audit trail (50+ log entries)
9. **fileUploads** - File tracking metadata

## 📊 API Endpoints

### Entities API
```
GET    /api/entities              # List all entities with filters
GET    /api/entities?id=[id]      # Get single entity
POST   /api/entities              # Create new entity
PUT    /api/entities?id=[id]      # Update entity
DELETE /api/entities?id=[id]      # Delete entity
```

### GL Accounts API
```
GET    /api/gl-accounts?entityId=[id]    # List accounts for entity
GET    /api/gl-accounts?id=[id]          # Get single account
POST   /api/gl-accounts                  # Create GL account
PUT    /api/gl-accounts?id=[id]          # Update account
DELETE /api/gl-accounts?id=[id]          # Delete account
```

### Trial Reports API
```
GET    /api/trial-reports                       # List all reports
GET    /api/trial-reports?id=[id]               # Get single report
GET    /api/trial-reports/validate?id=[id]      # Validate trial balance
POST   /api/trial-reports                       # Create report
PUT    /api/trial-reports?id=[id]               # Update report
DELETE /api/trial-reports?id=[id]               # Delete report
```

### Stakeholders API
```
GET    /api/stakeholders              # List stakeholders
GET    /api/stakeholders?id=[id]      # Get single stakeholder
POST   /api/stakeholders              # Create stakeholder
PUT    /api/stakeholders?id=[id]      # Update stakeholder
DELETE /api/stakeholders?id=[id]      # Delete stakeholder
```

### Assignments API
```
GET    /api/assignments              # List assignments
GET    /api/assignments?id=[id]      # Get single assignment
POST   /api/assignments              # Create assignment
PUT    /api/assignments?id=[id]      # Update assignment status
```

### Variance Analysis API
```
GET    /api/variance-analysis?reportId=[id]    # Get variances for report
GET    /api/variance-analysis?id=[id]          # Get single variance
POST   /api/variance-analysis                  # Create variance record
```

### Notifications API
```
GET    /api/notifications              # List notifications
GET    /api/notifications?id=[id]      # Get single notification
POST   /api/notifications              # Send notification
PUT    /api/notifications?id=[id]      # Mark as read
```

### Dashboard API
```
GET    /api/dashboard/stats    # Get comprehensive statistics
```

## 🎨 User Interface

### Dashboard View
- **Statistics Cards**: 8 real-time KPI cards
- **Trial Reports Table**: Status, balances, validation results
- **Notification Panel**: Unread alerts and reminders
- **Quick Actions**: Access to common workflows

### Upload Interface
- **File Selection**: Drag-and-drop or browse
- **Metadata Entry**: Entity ID, report type, period
- **Validation**: Real-time file parsing and balance checking
- **Progress Feedback**: Success/error messages with details

### Variance Analysis
- **Bar Charts**: Top 10 variances by percentage
- **Pie Charts**: Anomaly distribution
- **Period Comparison**: Variance breakdown by time period
- **Critical Alerts**: List of anomalies requiring attention

### Entity Management
- **Data Table**: Sortable, searchable entity list
- **Filters**: Department, region, status
- **Pagination**: Efficient handling of large datasets
- **Bulk Actions**: Multi-entity operations

### Stakeholder Portal
- **Team Overview**: All stakeholders with roles
- **Assignment Tracking**: Current workload by person
- **Status Dashboard**: Pending, completed, overdue stats
- **Contact Information**: Email and notification preferences

### AI Chat Interface
- **Conversational UI**: Natural language interaction
- **Context-aware**: Understands financial terminology
- **Multi-turn Conversations**: Follow-up questions supported
- **Quick Insights**: Instant answers to complex queries

## 🚦 Getting Started

### Prerequisites
```bash
Node.js 18+ or Bun
Turso Database Account
```

### Installation
```bash
# Install dependencies
npm install

# Environment variables are already configured in .env

# Start development server
npm run dev
```

### Access the Application
Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📱 Key Components

### Frontend Components
- `DashboardStats.tsx` - Statistics overview with 8 KPI cards
- `FileUpload.tsx` - Multi-format file upload with validation
- `TrialReportsList.tsx` - Report management table
- `EntityTable.tsx` - Entity management with filters
- `VarianceAnalysisChart.tsx` - Visual analytics with Recharts
- `AIChat.tsx` - Conversational AI interface
- `NotificationPanel.tsx` - Alert management system
- `StakeholderPortal.tsx` - Team and assignment tracking

## 📊 Sample Data

The system includes comprehensive seed data:
- **50 Entities** across Finance, Operations, Sales, IT, HR
- **150 GL Accounts** covering all account types
- **30 Trial Reports** in various statuses
- **20 Stakeholders** with different roles
- **40 Assignments** with realistic timelines
- **50 Variance Records** with anomaly detection
- **30 Notifications** (12 unread)
- **50 Audit Log Entries** tracking all actions

## 🎯 Use Cases

### 1. Monthly Close Process
- Upload trial balances for all entities
- Automated validation and variance detection
- Stakeholder notifications for reviews
- Approval workflow with audit trail
- Compliance reporting

### 2. Quarterly Review
- Period-over-period variance analysis
- Anomaly identification and investigation
- Executive dashboard with key metrics
- AI-powered insights and recommendations

### 3. Multi-Entity Management
- Centralized control of 1,000+ entities
- Department and region-based filtering
- Workload distribution across team
- Real-time status tracking

### 4. Compliance Monitoring
- Automated balance validation
- Supporting document verification
- Audit trail for regulatory requirements
- Exception reporting and alerts

## 🔮 AI Capabilities

### Natural Language Queries
- "Show me all pending reviews in Finance department"
- "What are the largest variances this quarter?"
- "Which entities have overdue assignments?"
- "Explain the anomaly in account 5000"

### Intelligent Insights
- Anomaly detection with root cause analysis
- Predictive alerts for potential issues
- Automated categorization of variances
- Compliance risk assessment

## 📄 License

Copyright © 2024 Balance Sheet Assurance Agent. All rights reserved.

---

**Ready to revolutionize your financial statement review process!** 🚀

For questions or support, please refer to the documentation or contact your system administrator.