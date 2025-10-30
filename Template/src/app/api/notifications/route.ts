import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { notifications } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

const VALID_NOTIFICATION_TYPES = ['reminder', 'alert', 'approval_request'];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Single notification by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const notification = await db
        .select()
        .from(notifications)
        .where(eq(notifications.id, parseInt(id)))
        .limit(1);

      if (notification.length === 0) {
        return NextResponse.json(
          { error: 'Notification not found', code: 'NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(notification[0], { status: 200 });
    }

    // List notifications with filtering
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const stakeholderId = searchParams.get('stakeholderId');
    const readStatus = searchParams.get('readStatus');
    const type = searchParams.get('type');

    let query = db.select().from(notifications);

    // Build filter conditions
    const conditions = [];

    if (stakeholderId) {
      const stakeholderIdInt = parseInt(stakeholderId);
      if (isNaN(stakeholderIdInt)) {
        return NextResponse.json(
          { error: 'Valid stakeholderId is required', code: 'INVALID_STAKEHOLDER_ID' },
          { status: 400 }
        );
      }
      conditions.push(eq(notifications.stakeholderId, stakeholderIdInt));
    }

    if (readStatus !== null && readStatus !== undefined) {
      const readStatusBool = readStatus === 'true' ? 1 : 0;
      conditions.push(eq(notifications.readStatus, readStatusBool));
    }

    if (type) {
      if (!VALID_NOTIFICATION_TYPES.includes(type)) {
        return NextResponse.json(
          {
            error: `Invalid notification type. Must be one of: ${VALID_NOTIFICATION_TYPES.join(', ')}`,
            code: 'INVALID_TYPE',
          },
          { status: 400 }
        );
      }
      conditions.push(eq(notifications.type, type));
    }

    // Apply filters if any
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
    const { stakeholderId, message, type, relatedEntityId, relatedReportId } = body;

    // Validate required fields
    if (!stakeholderId) {
      return NextResponse.json(
        { error: 'stakeholderId is required', code: 'MISSING_STAKEHOLDER_ID' },
        { status: 400 }
      );
    }

    if (!message) {
      return NextResponse.json(
        { error: 'message is required', code: 'MISSING_MESSAGE' },
        { status: 400 }
      );
    }

    if (!type) {
      return NextResponse.json(
        { error: 'type is required', code: 'MISSING_TYPE' },
        { status: 400 }
      );
    }

    // Validate type
    if (!VALID_NOTIFICATION_TYPES.includes(type)) {
      return NextResponse.json(
        {
          error: `Invalid notification type. Must be one of: ${VALID_NOTIFICATION_TYPES.join(', ')}`,
          code: 'INVALID_TYPE',
        },
        { status: 400 }
      );
    }

    // Validate stakeholderId is a number
    const stakeholderIdInt = parseInt(stakeholderId);
    if (isNaN(stakeholderIdInt)) {
      return NextResponse.json(
        { error: 'Valid stakeholderId is required', code: 'INVALID_STAKEHOLDER_ID' },
        { status: 400 }
      );
    }

    // Build insert data
    const insertData: {
      stakeholderId: number;
      message: string;
      type: string;
      readStatus: number;
      sentAt: string;
      relatedEntityId?: number;
      relatedReportId?: number;
    } = {
      stakeholderId: stakeholderIdInt,
      message: message.trim(),
      type,
      readStatus: 0,
      sentAt: new Date().toISOString(),
    };

    // Add optional fields if provided
    if (relatedEntityId !== undefined && relatedEntityId !== null) {
      const relatedEntityIdInt = parseInt(relatedEntityId);
      if (!isNaN(relatedEntityIdInt)) {
        insertData.relatedEntityId = relatedEntityIdInt;
      }
    }

    if (relatedReportId !== undefined && relatedReportId !== null) {
      const relatedReportIdInt = parseInt(relatedReportId);
      if (!isNaN(relatedReportIdInt)) {
        insertData.relatedReportId = relatedReportIdInt;
      }
    }

    const newNotification = await db.insert(notifications).values(insertData).returning();

    return NextResponse.json(newNotification[0], { status: 201 });
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

    const body = await request.json();
    const { readStatus } = body;

    // Check if notification exists
    const existing = await db
      .select()
      .from(notifications)
      .where(eq(notifications.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Notification not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // Build update data
    const updateData: { readStatus?: number } = {};

    if (readStatus !== undefined && readStatus !== null) {
      // Convert boolean or string to integer (0 or 1)
      if (typeof readStatus === 'boolean') {
        updateData.readStatus = readStatus ? 1 : 0;
      } else if (readStatus === 'true' || readStatus === 1 || readStatus === '1') {
        updateData.readStatus = 1;
      } else if (readStatus === 'false' || readStatus === 0 || readStatus === '0') {
        updateData.readStatus = 0;
      } else {
        return NextResponse.json(
          { error: 'Invalid readStatus value', code: 'INVALID_READ_STATUS' },
          { status: 400 }
        );
      }
    }

    // If no valid fields to update
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update', code: 'NO_FIELDS_TO_UPDATE' },
        { status: 400 }
      );
    }

    const updated = await db
      .update(notifications)
      .set(updateData)
      .where(eq(notifications.id, parseInt(id)))
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