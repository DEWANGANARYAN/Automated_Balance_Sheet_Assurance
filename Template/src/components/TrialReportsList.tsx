"use client"

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { FileText, Loader2, Eye, TrendingUp, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { TrialReport } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export default function TrialReportsList() {
  const [reports, setReports] = useState<TrialReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<TrialReport | null>(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/trial-reports?limit=20');
      const data = await response.json();
      setReports(data);
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'in_review':
        return <TrendingUp className="h-4 w-4 text-blue-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
    }
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'approved':
        return 'default';
      case 'rejected':
        return 'destructive';
      case 'in_review':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Trial Reports</h2>
          </div>
          <Badge variant="outline">{reports.length} reports</Badge>
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Report ID</TableHead>
                <TableHead>Entity ID</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total Debits</TableHead>
                <TableHead>Total Credits</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  </TableCell>
                </TableRow>
              ) : reports.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    No trial reports found
                  </TableCell>
                </TableRow>
              ) : (
                reports.map((report) => (
                  <TableRow key={report.id} className="hover:bg-muted/50">
                    <TableCell className="font-mono text-sm">#{report.id}</TableCell>
                    <TableCell className="font-medium">{report.entityId}</TableCell>
                    <TableCell className="text-sm">
                      {new Date(report.reportingPeriod).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{report.reportType}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(report.status)}
                        <Badge variant={getStatusVariant(report.status)}>
                          {report.status}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      ${report.totalDebits.toLocaleString()}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      ${report.totalCredits.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <span className={`font-mono text-sm ${
                        report.balanceDifference === 0 
                          ? 'text-green-600' 
                          : 'text-red-600 font-semibold'
                      }`}>
                        {report.balanceDifference === 0 
                          ? '✓ Balanced' 
                          : `${report.balanceDifference > 0 ? '+' : ''}$${report.balanceDifference.toLocaleString()}`}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setSelectedReport(report)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Trial Report Details</DialogTitle>
                            <DialogDescription>
                              Report #{report.id} - Entity {report.entityId}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid grid-cols-2 gap-4 py-4">
                            <div className="space-y-2">
                              <p className="text-sm font-medium text-muted-foreground">Reporting Period</p>
                              <p className="text-sm">{new Date(report.reportingPeriod).toLocaleDateString()}</p>
                            </div>
                            <div className="space-y-2">
                              <p className="text-sm font-medium text-muted-foreground">Report Type</p>
                              <p className="text-sm capitalize">{report.reportType}</p>
                            </div>
                            <div className="space-y-2">
                              <p className="text-sm font-medium text-muted-foreground">Total Debits</p>
                              <p className="text-sm font-mono">${report.totalDebits.toLocaleString()}</p>
                            </div>
                            <div className="space-y-2">
                              <p className="text-sm font-medium text-muted-foreground">Total Credits</p>
                              <p className="text-sm font-mono">${report.totalCredits.toLocaleString()}</p>
                            </div>
                            <div className="space-y-2">
                              <p className="text-sm font-medium text-muted-foreground">Balance Difference</p>
                              <p className={`text-sm font-mono ${
                                report.balanceDifference === 0 ? 'text-green-600' : 'text-red-600'
                              }`}>
                                ${report.balanceDifference.toLocaleString()}
                              </p>
                            </div>
                            <div className="space-y-2">
                              <p className="text-sm font-medium text-muted-foreground">Status</p>
                              <Badge variant={getStatusVariant(report.status)}>
                                {report.status}
                              </Badge>
                            </div>
                            <div className="space-y-2">
                              <p className="text-sm font-medium text-muted-foreground">Uploaded</p>
                              <p className="text-sm">{new Date(report.uploadedAt).toLocaleString()}</p>
                            </div>
                            {report.reviewedAt && (
                              <div className="space-y-2">
                                <p className="text-sm font-medium text-muted-foreground">Reviewed</p>
                                <p className="text-sm">{new Date(report.reviewedAt).toLocaleString()}</p>
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </Card>
  );
}
