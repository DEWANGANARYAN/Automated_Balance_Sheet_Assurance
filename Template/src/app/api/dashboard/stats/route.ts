import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { entities, trialReports, assignments, stakeholders, notifications } from '@/db/schema';
import { eq, count, or } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // Execute all count queries in parallel for efficiency
    const [
      totalEntitiesResult,
      totalReportsResult,
      pendingReviewsResult,
      overdueAssignmentsResult,
      approvedReportsResult,
      rejectedReportsResult,
      totalStakeholdersResult,
      activeEntitiesResult,
      unreadNotificationsResult
    ] = await Promise.all([
      // Total entities count
      db.select({ count: count() })
        .from(entities),

      // Total trial reports count
      db.select({ count: count() })
        .from(trialReports),

      // Pending reviews count (status 'pending' or 'in_review')
      db.select({ count: count() })
        .from(trialReports)
        .where(or(
          eq(trialReports.status, 'pending'),
          eq(trialReports.status, 'in_review')
        )),

      // Overdue assignments count
      db.select({ count: count() })
        .from(assignments)
        .where(eq(assignments.status, 'overdue')),

      // Approved reports count
      db.select({ count: count() })
        .from(trialReports)
        .where(eq(trialReports.status, 'approved')),

      // Rejected reports count
      db.select({ count: count() })
        .from(trialReports)
        .where(eq(trialReports.status, 'rejected')),

      // Total stakeholders count
      db.select({ count: count() })
        .from(stakeholders),

      // Active entities count
      db.select({ count: count() })
        .from(entities)
        .where(eq(entities.status, 'active')),

      // Unread notifications count
      db.select({ count: count() })
        .from(notifications)
        .where(eq(notifications.readStatus, false))
    ]);

    // Extract counts from results
    const statistics = {
      totalEntities: totalEntitiesResult[0]?.count ?? 0,
      totalReports: totalReportsResult[0]?.count ?? 0,
      pendingReviews: pendingReviewsResult[0]?.count ?? 0,
      overdueAssignments: overdueAssignmentsResult[0]?.count ?? 0,
      approvedReports: approvedReportsResult[0]?.count ?? 0,
      rejectedReports: rejectedReportsResult[0]?.count ?? 0,
      totalStakeholders: totalStakeholdersResult[0]?.count ?? 0,
      activeEntities: activeEntitiesResult[0]?.count ?? 0,
      unreadNotifications: unreadNotificationsResult[0]?.count ?? 0,
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(statistics, { status: 200 });

  } catch (error) {
    console.error('GET dashboard statistics error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'DASHBOARD_STATS_ERROR'
      },
      { status: 500 }
    );
  }
}