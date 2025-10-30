"use client"

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { 
  Building2, 
  FileText, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  XCircle,
  Users,
  TrendingUp,
  Bell
} from 'lucide-react';
import { DashboardStats as Stats } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardStats() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/dashboard/stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="p-6">
            <Skeleton className="h-20 w-full" />
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const statCards = [
    {
      title: 'Total Entities',
      value: stats.totalEntities,
      icon: Building2,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      subtext: `${stats.activeEntities} active`,
    },
    {
      title: 'Total Reports',
      value: stats.totalReports,
      icon: FileText,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      subtext: 'All time',
    },
    {
      title: 'Pending Reviews',
      value: stats.pendingReviews,
      icon: Clock,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
      subtext: 'Requires action',
      alert: stats.pendingReviews > 10,
    },
    {
      title: 'Overdue Tasks',
      value: stats.overdueAssignments,
      icon: AlertCircle,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
      subtext: 'Past deadline',
      alert: stats.overdueAssignments > 0,
    },
    {
      title: 'Approved Reports',
      value: stats.approvedReports,
      icon: CheckCircle,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      subtext: 'Validated',
    },
    {
      title: 'Rejected Reports',
      value: stats.rejectedReports,
      icon: XCircle,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
      subtext: 'Needs revision',
    },
    {
      title: 'Active Stakeholders',
      value: stats.totalStakeholders,
      icon: Users,
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-500/10',
      subtext: 'Team members',
    },
    {
      title: 'Unread Alerts',
      value: stats.unreadNotifications,
      icon: Bell,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
      subtext: 'Notifications',
      alert: stats.unreadNotifications > 5,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat, index) => (
        <Card 
          key={index} 
          className={`p-6 hover:shadow-lg transition-shadow ${
            stat.alert ? 'border-destructive' : ''
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </p>
              <p className="text-3xl font-bold tracking-tight">
                {stat.value.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">
                {stat.subtext}
              </p>
            </div>
            <div className={`${stat.bgColor} p-3 rounded-lg`}>
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
            </div>
          </div>
          {stat.alert && (
            <div className="mt-3 flex items-center gap-1 text-xs text-destructive">
              <AlertCircle className="h-3 w-3" />
              <span>Requires attention</span>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}
