export interface Entity {
  id: number;
  name: string;
  code: string;
  department: string;
  region: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface GLAccount {
  id: number;
  entityId: number;
  accountNumber: string;
  accountName: string;
  accountType: string;
  currentBalance: number;
  previousBalance: number;
  openingBalance: number;
  currency: string;
  lastUpdated: string;
}

export interface TrialReport {
  id: number;
  entityId: number;
  reportingPeriod: string;
  reportType: string;
  status: string;
  totalDebits: number;
  totalCredits: number;
  balanceDifference: number;
  uploadedBy: number | null;
  uploadedAt: string;
  reviewedBy: number | null;
  reviewedAt: string | null;
  fileUrl: string | null;
}

export interface Stakeholder {
  id: number;
  name: string;
  email: string;
  role: string;
  department: string;
  entities: number[];
  notificationPreferences: {
    email: boolean;
    inApp: boolean;
    sms?: boolean;
  };
  createdAt: string;
}

export interface Assignment {
  id: number;
  entityId: number;
  stakeholderId: number;
  roleType: string;
  dueDate: string;
  status: string;
  assignedAt: string;
  completedAt: string | null;
}

export interface VarianceAnalysis {
  id: number;
  trialReportId: number;
  glAccountId: number;
  varianceAmount: number;
  variancePercentage: number;
  periodComparison: string;
  anomalyDetected: boolean;
  anomalyReason: string | null;
  createdAt: string;
  accountNumber?: string;
  accountName?: string;
  accountType?: string;
}

export interface Notification {
  id: number;
  stakeholderId: number;
  message: string;
  type: string;
  readStatus: boolean;
  sentAt: string;
  relatedEntityId: number | null;
  relatedReportId: number | null;
}

export interface DashboardStats {
  totalEntities: number;
  totalReports: number;
  pendingReviews: number;
  overdueAssignments: number;
  approvedReports: number;
  rejectedReports: number;
  totalStakeholders: number;
  activeEntities: number;
  unreadNotifications: number;
  timestamp: string;
}
