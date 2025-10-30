import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { trialReports } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

const VALID_REPORT_TYPES = ['monthly', 'quarterly', 'yearly'];
const VALID_STATUSES = ['pending', 'in_review', 'approved', 'rejected'];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Single record by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const report = await db
        .select()
        .from(trialReports)
        .where(eq(trialReports.id, parseInt(id)))
        .limit(1);

      if (report.length === 0) {
        return NextResponse.json(
          { error: 'Trial report not found', code: 'NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(report[0], { status: 200 });
    }

    // List with filters
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const entityId = searchParams.get('entityId');
    const status = searchParams.get('status');
    const reportType = searchParams.get('reportType');
    const reportingPeriod = searchParams.get('reportingPeriod');

    let query = db.select().from(trialReports);

    // Build filter conditions
    const conditions = [];

    if (entityId) {
      if (isNaN(parseInt(entityId))) {
        return NextResponse.json(
          { error: 'Valid entity ID is required', code: 'INVALID_ENTITY_ID' },
          { status: 400 }
        );
      }
      conditions.push(eq(trialReports.entityId, parseInt(entityId)));
    }

    if (status) {
      if (!VALID_STATUSES.includes(status)) {
        return NextResponse.json(
          {
            error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`,
            code: 'INVALID_STATUS',
          },
          { status: 400 }
        );
      }
      conditions.push(eq(trialReports.status, status));
    }

    if (reportType) {
      if (!VALID_REPORT_TYPES.includes(reportType)) {
        return NextResponse.json(
          {
            error: `Invalid report type. Must be one of: ${VALID_REPORT_TYPES.join(', ')}`,
            code: 'INVALID_REPORT_TYPE',
          },
          { status: 400 }
        );
      }
      conditions.push(eq(trialReports.reportType, reportType));
    }

    if (reportingPeriod) {
      conditions.push(eq(trialReports.reportingPeriod, reportingPeriod));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query.limit(limit).offset(offset);

    return NextResponse.json(results, { status: 200 });
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
    const { entityId, reportingPeriod, reportType, totalDebits, totalCredits, uploadedBy, fileUrl } = body;

    // Validate required fields
    if (!entityId) {
      return NextResponse.json(
        { error: 'Entity ID is required', code: 'MISSING_ENTITY_ID' },
        { status: 400 }
      );
    }

    if (!reportingPeriod) {
      return NextResponse.json(
        { error: 'Reporting period is required', code: 'MISSING_REPORTING_PERIOD' },
        { status: 400 }
      );
    }

    if (!reportType) {
      return NextResponse.json(
        { error: 'Report type is required', code: 'MISSING_REPORT_TYPE' },
        { status: 400 }
      );
    }

    if (!VALID_REPORT_TYPES.includes(reportType)) {
      return NextResponse.json(
        {
          error: `Invalid report type. Must be one of: ${VALID_REPORT_TYPES.join(', ')}`,
          code: 'INVALID_REPORT_TYPE',
        },
        { status: 400 }
      );
    }

    if (totalDebits === undefined || totalDebits === null) {
      return NextResponse.json(
        { error: 'Total debits is required', code: 'MISSING_TOTAL_DEBITS' },
        { status: 400 }
      );
    }

    if (totalCredits === undefined || totalCredits === null) {
      return NextResponse.json(
        { error: 'Total credits is required', code: 'MISSING_TOTAL_CREDITS' },
        { status: 400 }
      );
    }

    // Validate numeric types
    if (isNaN(parseInt(entityId.toString()))) {
      return NextResponse.json(
        { error: 'Entity ID must be a valid number', code: 'INVALID_ENTITY_ID' },
        { status: 400 }
      );
    }

    if (isNaN(parseFloat(totalDebits.toString()))) {
      return NextResponse.json(
        { error: 'Total debits must be a valid number', code: 'INVALID_TOTAL_DEBITS' },
        { status: 400 }
      );
    }

    if (isNaN(parseFloat(totalCredits.toString()))) {
      return NextResponse.json(
        { error: 'Total credits must be a valid number', code: 'INVALID_TOTAL_CREDITS' },
        { status: 400 }
      );
    }

    if (uploadedBy && isNaN(parseInt(uploadedBy.toString()))) {
      return NextResponse.json(
        { error: 'Uploaded by must be a valid number', code: 'INVALID_UPLOADED_BY' },
        { status: 400 }
      );
    }

    // Calculate balance difference
    const balanceDifference = parseFloat(totalDebits.toString()) - parseFloat(totalCredits.toString());

    // Prepare insert data
    const insertData: any = {
      entityId: parseInt(entityId.toString()),
      reportingPeriod: reportingPeriod.trim(),
      reportType: reportType.trim(),
      status: 'pending',
      totalDebits: parseFloat(totalDebits.toString()),
      totalCredits: parseFloat(totalCredits.toString()),
      balanceDifference,
      uploadedAt: new Date().toISOString(),
    };

    if (uploadedBy) {
      insertData.uploadedBy = parseInt(uploadedBy.toString());
    }

    if (fileUrl) {
      insertData.fileUrl = fileUrl.trim();
    }

    const newReport = await db.insert(trialReports).values(insertData).returning();

    return NextResponse.json(newReport[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Check if report exists
    const existing = await db
      .select()
      .from(trialReports)
      .where(eq(trialReports.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Trial report not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { status, totalDebits, totalCredits, reviewedBy, fileUrl } = body;

    // Validate status if provided
    if (status && !VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        {
          error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`,
          code: 'INVALID_STATUS',
        },
        { status: 400 }
      );
    }

    // Validate numeric fields if provided
    if (totalDebits !== undefined && isNaN(parseFloat(totalDebits.toString()))) {
      return NextResponse.json(
        { error: 'Total debits must be a valid number', code: 'INVALID_TOTAL_DEBITS' },
        { status: 400 }
      );
    }

    if (totalCredits !== undefined && isNaN(parseFloat(totalCredits.toString()))) {
      return NextResponse.json(
        { error: 'Total credits must be a valid number', code: 'INVALID_TOTAL_CREDITS' },
        { status: 400 }
      );
    }

    if (reviewedBy !== undefined && reviewedBy !== null && isNaN(parseInt(reviewedBy.toString()))) {
      return NextResponse.json(
        { error: 'Reviewed by must be a valid number', code: 'INVALID_REVIEWED_BY' },
        { status: 400 }
      );
    }

    // Prepare update data
    const updateData: any = {};

    if (status) {
      updateData.status = status.trim();
      // Auto-update reviewedAt if status changes to approved or rejected
      if (status === 'approved' || status === 'rejected') {
        updateData.reviewedAt = new Date().toISOString();
      }
    }

    if (totalDebits !== undefined) {
      updateData.totalDebits = parseFloat(totalDebits.toString());
    }

    if (totalCredits !== undefined) {
      updateData.totalCredits = parseFloat(totalCredits.toString());
    }

    if (reviewedBy !== undefined) {
      updateData.reviewedBy = reviewedBy === null ? null : parseInt(reviewedBy.toString());
    }

    if (fileUrl !== undefined) {
      updateData.fileUrl = fileUrl ? fileUrl.trim() : null;
    }

    // Calculate balance difference if debits or credits changed
    if (totalDebits !== undefined || totalCredits !== undefined) {
      const currentDebits = totalDebits !== undefined ? parseFloat(totalDebits.toString()) : existing[0].totalDebits;
      const currentCredits = totalCredits !== undefined ? parseFloat(totalCredits.toString()) : existing[0].totalCredits;
      updateData.balanceDifference = currentDebits - currentCredits;
    }

    const updated = await db
      .update(trialReports)
      .set(updateData)
      .where(eq(trialReports.id, parseInt(id)))
      .returning();

    return NextResponse.json(updated[0], { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Check if report exists
    const existing = await db
      .select()
      .from(trialReports)
      .where(eq(trialReports.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Trial report not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const deleted = await db
      .delete(trialReports)
      .where(eq(trialReports.id, parseInt(id)))
      .returning();

    return NextResponse.json(
      {
        message: 'Trial report deleted successfully',
        deletedReport: deleted[0],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}