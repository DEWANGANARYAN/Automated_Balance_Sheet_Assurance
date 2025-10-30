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
import { Users, Loader2, Mail, Calendar, AlertCircle } from 'lucide-react';
import { Stakeholder, Assignment } from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function StakeholderPortal() {
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [stakeholdersRes, assignmentsRes] = await Promise.all([
        fetch('/api/stakeholders?limit=20'),
        fetch('/api/assignments?limit=50'),
      ]);
      
      const stakeholdersData = await stakeholdersRes.json();
      const assignmentsData = await assignmentsRes.json();
      
      setStakeholders(stakeholdersData);
      setAssignments(assignmentsData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleBadgeVariant = (role: string): "default" | "secondary" | "outline" => {
    switch (role) {
      case 'admin':
        return 'default';
      case 'approver':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getAssignmentStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600';
      case 'overdue':
        return 'text-red-600';
      case 'in_progress':
        return 'text-blue-600';
      default:
        return 'text-amber-600';
    }
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <Tabs defaultValue="stakeholders" className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Stakeholder Portal</h2>
          </div>
          <TabsList>
            <TabsTrigger value="stakeholders">Stakeholders</TabsTrigger>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="stakeholders" className="space-y-4">
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Entities Assigned</TableHead>
                  <TableHead>Notifications</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stakeholders.map((stakeholder) => (
                  <TableRow key={stakeholder.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{stakeholder.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{stakeholder.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(stakeholder.role)}>
                        {stakeholder.role}
                      </Badge>
                    </TableCell>
                    <TableCell>{stakeholder.department}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {stakeholder.entities?.length || 0} entities
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {stakeholder.notificationPreferences?.email && (
                          <Badge variant="secondary" className="text-xs">Email</Badge>
                        )}
                        {stakeholder.notificationPreferences?.inApp && (
                          <Badge variant="secondary" className="text-xs">In-App</Badge>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="assignments" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <Card className="p-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Assignments</p>
                <p className="text-2xl font-bold">{assignments.length}</p>
              </div>
            </Card>
            <Card className="p-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-amber-600">
                  {assignments.filter(a => a.status === 'pending').length}
                </p>
              </div>
            </Card>
            <Card className="p-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Overdue</p>
                <p className="text-2xl font-bold text-red-600">
                  {assignments.filter(a => a.status === 'overdue').length}
                </p>
              </div>
            </Card>
          </div>

          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Assignment ID</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>Stakeholder</TableHead>
                  <TableHead>Role Type</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progress</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignments.slice(0, 20).map((assignment) => {
                  const stakeholder = stakeholders.find(s => s.id === assignment.stakeholderId);
                  const isOverdue = new Date(assignment.dueDate) < new Date() && assignment.status !== 'completed';
                  
                  return (
                    <TableRow key={assignment.id} className="hover:bg-muted/50">
                      <TableCell className="font-mono text-sm">#{assignment.id}</TableCell>
                      <TableCell className="font-medium">Entity {assignment.entityId}</TableCell>
                      <TableCell className="text-sm">
                        {stakeholder?.name || `Stakeholder ${assignment.stakeholderId}`}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{assignment.roleType}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span className={`text-sm ${isOverdue ? 'text-red-600 font-semibold' : ''}`}>
                            {new Date(assignment.dueDate).toLocaleDateString()}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={assignment.status === 'completed' ? 'default' : 'outline'}
                          className={getAssignmentStatusColor(assignment.status)}
                        >
                          {assignment.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {assignment.completedAt ? (
                          <span className="text-xs text-green-600">
                            ✓ {new Date(assignment.completedAt).toLocaleDateString()}
                          </span>
                        ) : isOverdue ? (
                          <div className="flex items-center gap-1 text-red-600">
                            <AlertCircle className="h-3 w-3" />
                            <span className="text-xs">Overdue</span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">In progress</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
}
