"use client"

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DashboardStats from '@/components/DashboardStats';
import EntityTable from '@/components/EntityTable';
import TrialReportsList from '@/components/TrialReportsList';
import FileUpload from '@/components/FileUpload';
import VarianceAnalysisChart from '@/components/VarianceAnalysisChart';
import AIChat from '@/components/AIChat';
import NotificationPanel from '@/components/NotificationPanel';
import StakeholderPortal from '@/components/StakeholderPortal';
import { 
  LayoutDashboard, 
  Upload, 
  FileText, 
  Building2, 
  TrendingUp, 
  Users,
  Sparkles,
  Bell
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Home() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showAIChat, setShowAIChat] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-lg">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Balance Sheet Assurance Agent</h1>
                <p className="text-sm text-muted-foreground">
                  AI-Powered Financial Statement Review for 1,000+ Entities
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={showAIChat ? "default" : "outline"}
                onClick={() => setShowAIChat(!showAIChat)}
                className="gap-2"
              >
                <Sparkles className="h-4 w-4" />
                AI Assistant
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Area */}
          <div className={showAIChat ? 'lg:col-span-2' : 'lg:col-span-3'}>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-7">
                <TabsTrigger value="dashboard" className="gap-2">
                  <LayoutDashboard className="h-4 w-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                </TabsTrigger>
                <TabsTrigger value="upload" className="gap-2">
                  <Upload className="h-4 w-4" />
                  <span className="hidden sm:inline">Upload</span>
                </TabsTrigger>
                <TabsTrigger value="reports" className="gap-2">
                  <FileText className="h-4 w-4" />
                  <span className="hidden sm:inline">Reports</span>
                </TabsTrigger>
                <TabsTrigger value="entities" className="gap-2">
                  <Building2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Entities</span>
                </TabsTrigger>
                <TabsTrigger value="variance" className="gap-2">
                  <TrendingUp className="h-4 w-4" />
                  <span className="hidden sm:inline">Variance</span>
                </TabsTrigger>
                <TabsTrigger value="stakeholders" className="gap-2">
                  <Users className="h-4 w-4" />
                  <span className="hidden sm:inline">Team</span>
                </TabsTrigger>
                <TabsTrigger value="notifications" className="gap-2">
                  <Bell className="h-4 w-4" />
                  <span className="hidden sm:inline">Alerts</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="dashboard" className="space-y-6">
                <DashboardStats />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <TrialReportsList />
                  <NotificationPanel />
                </div>
              </TabsContent>

              <TabsContent value="upload">
                <FileUpload />
              </TabsContent>

              <TabsContent value="reports">
                <TrialReportsList />
              </TabsContent>

              <TabsContent value="entities">
                <EntityTable />
              </TabsContent>

              <TabsContent value="variance">
                <VarianceAnalysisChart 
                  variances={[
                    {
                      id: 1,
                      trialReportId: 1,
                      glAccountId: 1,
                      varianceAmount: 125000,
                      variancePercentage: 8.5,
                      periodComparison: 'MoM',
                      anomalyDetected: false,
                      anomalyReason: null,
                      createdAt: new Date().toISOString(),
                      accountNumber: '1000',
                      accountName: 'Cash and Equivalents',
                      accountType: 'Asset'
                    },
                    {
                      id: 2,
                      trialReportId: 1,
                      glAccountId: 2,
                      varianceAmount: -75000,
                      variancePercentage: -5.2,
                      periodComparison: 'MoM',
                      anomalyDetected: false,
                      anomalyReason: null,
                      createdAt: new Date().toISOString(),
                      accountNumber: '1100',
                      accountName: 'Accounts Receivable',
                      accountType: 'Asset'
                    },
                    {
                      id: 3,
                      trialReportId: 1,
                      glAccountId: 3,
                      varianceAmount: 450000,
                      variancePercentage: 35.8,
                      periodComparison: 'QoQ',
                      anomalyDetected: true,
                      anomalyReason: 'Unusual spike in expenses compared to previous period',
                      createdAt: new Date().toISOString(),
                      accountNumber: '5000',
                      accountName: 'Operating Expenses',
                      accountType: 'Expense'
                    },
                    {
                      id: 4,
                      trialReportId: 2,
                      glAccountId: 4,
                      varianceAmount: -320000,
                      variancePercentage: -42.5,
                      periodComparison: 'YoY',
                      anomalyDetected: true,
                      anomalyReason: 'Significant revenue drop requiring investigation',
                      createdAt: new Date().toISOString(),
                      accountNumber: '4000',
                      accountName: 'Revenue',
                      accountType: 'Revenue'
                    },
                    {
                      id: 5,
                      trialReportId: 2,
                      glAccountId: 5,
                      varianceAmount: 88000,
                      variancePercentage: 12.3,
                      periodComparison: 'MoM',
                      anomalyDetected: false,
                      anomalyReason: null,
                      createdAt: new Date().toISOString(),
                      accountNumber: '1300',
                      accountName: 'Fixed Assets',
                      accountType: 'Asset'
                    },
                    {
                      id: 6,
                      trialReportId: 3,
                      glAccountId: 6,
                      varianceAmount: 275000,
                      variancePercentage: 28.5,
                      periodComparison: 'QoQ',
                      anomalyDetected: true,
                      anomalyReason: 'Large one-time transaction detected',
                      createdAt: new Date().toISOString(),
                      accountNumber: '2100',
                      accountName: 'Long-term Debt',
                      accountType: 'Liability'
                    },
                    {
                      id: 7,
                      trialReportId: 3,
                      glAccountId: 7,
                      varianceAmount: -45000,
                      variancePercentage: -8.9,
                      periodComparison: 'MoM',
                      anomalyDetected: false,
                      anomalyReason: null,
                      createdAt: new Date().toISOString(),
                      accountNumber: '3000',
                      accountName: 'Equity',
                      accountType: 'Equity'
                    },
                    {
                      id: 8,
                      trialReportId: 4,
                      glAccountId: 8,
                      varianceAmount: 195000,
                      variancePercentage: 22.4,
                      periodComparison: 'YoY',
                      anomalyDetected: false,
                      anomalyReason: null,
                      createdAt: new Date().toISOString(),
                      accountNumber: '4100',
                      accountName: 'Other Income',
                      accountType: 'Revenue'
                    },
                    {
                      id: 9,
                      trialReportId: 4,
                      glAccountId: 9,
                      varianceAmount: -98000,
                      variancePercentage: -14.2,
                      periodComparison: 'MoM',
                      anomalyDetected: false,
                      anomalyReason: null,
                      createdAt: new Date().toISOString(),
                      accountNumber: '2000',
                      accountName: 'Accounts Payable',
                      accountType: 'Liability'
                    },
                    {
                      id: 10,
                      trialReportId: 5,
                      glAccountId: 10,
                      varianceAmount: 420000,
                      variancePercentage: 38.2,
                      periodComparison: 'QoQ',
                      anomalyDetected: true,
                      anomalyReason: 'Quarterly seasonal adjustment outside normal range',
                      createdAt: new Date().toISOString(),
                      accountNumber: '5100',
                      accountName: 'Cost of Sales',
                      accountType: 'Expense'
                    }
                  ]} 
                />
              </TabsContent>

              <TabsContent value="stakeholders">
                <StakeholderPortal />
              </TabsContent>

              <TabsContent value="notifications">
                <NotificationPanel />
              </TabsContent>
            </Tabs>
          </div>

          {/* AI Chat Sidebar */}
          {showAIChat && (
            <div className="lg:col-span-1">
              <div className="sticky top-6">
                <AIChat />
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <p>© 2024 Balance Sheet Assurance Agent. Powered by AI.</p>
            <p>Managing 50+ entities across 5 departments</p>
          </div>
        </div>
      </footer>
    </div>
  );
}