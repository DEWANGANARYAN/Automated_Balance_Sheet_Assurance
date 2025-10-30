import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { varianceAnalysis, glAccounts } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    const reportId = searchParams.get('reportId');

    // Get variance analysis by report ID
    if (reportId) {
      const reportIdNum = parseInt(reportId);
      if (isNaN(reportIdNum)) {
        return NextResponse.json(
          { error: 'Valid reportId is required', code: 'INVALID_REPORT_ID' },
          { status: 400 }
        );
      }

      const variances = await db
        .select({
          id: varianceAnalysis.id,
          trialReportId: varianceAnalysis.trialReportId,
          glAccountId: varianceAnalysis.glAccountId,
          varianceAmount: varianceAnalysis.varianceAmount,
          variancePercentage: varianceAnalysis.variancePercentage,
          periodComparison: varianceAnalysis.periodComparison,
          anomalyDetected: varianceAnalysis.anomalyDetected,
          anomalyReason: varianceAnalysis.anomalyReason,
          createdAt: varianceAnalysis.createdAt,
          accountNumber: glAccounts.accountNumber,
          accountName: glAccounts.accountName,
          accountType: glAccounts.accountType,
        })
        .from(varianceAnalysis)
        .leftJoin(glAccounts, eq(varianceAnalysis.glAccountId, glAccounts.id))
        .where(eq(varianceAnalysis.trialReportId, reportIdNum));

      if (variances.length === 0) {
        return NextResponse.json(
          { error: 'No variance data found for this report', code: 'NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(variances, { status: 200 });
    }

    // Get single variance analysis by ID
    if (id) {
      const idNum = parseInt(id);
      if (isNaN(idNum)) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const variance = await db
        .select({
          id: varianceAnalysis.id,
          trialReportId: varianceAnalysis.trialReportId,
          glAccountId: varianceAnalysis.glAccountId,
          varianceAmount: varianceAnalysis.varianceAmount,
          variancePercentage: varianceAnalysis.variancePercentage,
          periodComparison: varianceAnalysis.periodComparison,
          anomalyDetected: varianceAnalysis.anomalyDetected,
          anomalyReason: varianceAnalysis.anomalyReason,
          createdAt: varianceAnalysis.createdAt,
          accountNumber: glAccounts.accountNumber,
          accountName: glAccounts.accountName,
          accountType: glAccounts.accountType,
        })
        .from(varianceAnalysis)
        .leftJoin(glAccounts, eq(varianceAnalysis.glAccountId, glAccounts.id))
        .where(eq(varianceAnalysis.id, idNum))
        .limit(1);

      if (variance.length === 0) {
        return NextResponse.json(
          { error: 'Variance analysis not found', code: 'NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(variance[0], { status: 200 });
    }

    return NextResponse.json(
      { error: 'Either id or reportId parameter is required', code: 'MISSING_PARAMETER' },
      { status: 400 }
    );
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      trialReportId,
      glAccountId,
      varianceAmount,
      variancePercentage,
      periodComparison,
      anomalyDetected,
      anomalyReason,
    } = body;

    // Validate required fields
    if (!trialReportId) {
      return NextResponse.json(
        { error: 'trialReportId is required', code: 'MISSING_TRIAL_REPORT_ID' },
        { status: 400 }
      );
    }

    if (!glAccountId) {
      return NextResponse.json(
        { error: 'glAccountId is required', code: 'MISSING_GL_ACCOUNT_ID' },
        { status: 400 }
      );
    }

    if (varianceAmount === undefined || varianceAmount === null) {
      return NextResponse.json(
        { error: 'varianceAmount is required', code: 'MISSING_VARIANCE_AMOUNT' },
        { status: 400 }
      );
    }

    if (variancePercentage === undefined || variancePercentage === null) {
      return NextResponse.json(
        { error: 'variancePercentage is required', code: 'MISSING_VARIANCE_PERCENTAGE' },
        { status: 400 }
      );
    }

    if (!periodComparison) {
      return NextResponse.json(
        { error: 'periodComparison is required', code: 'MISSING_PERIOD_COMPARISON' },
        { status: 400 }
      );
    }

    // Validate periodComparison
    const validPeriods = ['MoM', 'QoQ', 'YoY'];
    if (!validPeriods.includes(periodComparison)) {
      return NextResponse.json(
        {
          error: `periodComparison must be one of: ${validPeriods.join(', ')}`,
          code: 'INVALID_PERIOD_COMPARISON',
        },
        { status: 400 }
      );
    }

    // Create variance analysis record
    const newVariance = await db
      .insert(varianceAnalysis)
      .values({
        trialReportId: parseInt(trialReportId),
        glAccountId: parseInt(glAccountId),
        varianceAmount: parseFloat(varianceAmount),
        variancePercentage: parseFloat(variancePercentage),
        periodComparison,
        anomalyDetected: anomalyDetected !== undefined ? anomalyDetected : false,
        anomalyReason: anomalyReason || null,
        createdAt: new Date().toISOString(),
      })
      .returning();

    return NextResponse.json(newVariance[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}