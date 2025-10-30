import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { trialReports } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Validate ID parameter
    if (!id) {
      return NextResponse.json(
        { 
          error: 'ID parameter is required',
          code: 'MISSING_ID' 
        },
        { status: 400 }
      );
    }

    if (isNaN(parseInt(id))) {
      return NextResponse.json(
        { 
          error: 'Valid ID is required',
          code: 'INVALID_ID' 
        },
        { status: 400 }
      );
    }

    // Query trial report by ID
    const report = await db.select()
      .from(trialReports)
      .where(eq(trialReports.id, parseInt(id)))
      .limit(1);

    if (report.length === 0) {
      return NextResponse.json(
        { 
          error: 'Trial report not found',
          code: 'REPORT_NOT_FOUND' 
        },
        { status: 404 }
      );
    }

    const trialReport = report[0];

    // Calculate balance difference
    const balanceDifference = trialReport.totalDebits - trialReport.totalCredits;
    const isValid = balanceDifference === 0;

    // Generate validation message
    let message: string;
    if (isValid) {
      message = 'Trial balance is valid. Total debits equal total credits.';
    } else {
      const difference = Math.abs(balanceDifference);
      const side = balanceDifference > 0 ? 'debits exceed credits' : 'credits exceed debits';
      message = `Trial balance is out of balance. ${side} by ${difference.toFixed(2)}.`;
    }

    // Return validation result
    return NextResponse.json({
      reportId: trialReport.id,
      isValid,
      totalDebits: trialReport.totalDebits,
      totalCredits: trialReport.totalCredits,
      balanceDifference,
      message
    }, { status: 200 });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}