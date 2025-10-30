import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { assignments } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

const VALID_ROLE_TYPES = ['uploader', 'reviewer', 'approver'];
const VALID_STATUSES = ['pending', 'completed', 'overdue'];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Single assignment by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const assignment = await db
        .select()
        .from(assignments)
        .where(eq(assignments.id, parseInt(id)))
        .limit(1);

      if (assignment.length === 0) {
        return NextResponse.json(
          { error: 'Assignment not found', code: 'ASSIGNMENT_NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(assignment[0], { status: 200 });
    }

    // List assignments with filters
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const entityId = searchParams.get('entityId');
    const stakeholderId = searchParams.get('stakeholderId');
    const status = searchParams.get('status');
    const roleType = searchParams.get('roleType');

    let query = db.select().from(assignments);

    // Build filter conditions
    const conditions = [];

    if (entityId) {
      const parsedEntityId = parseInt(entityId);
      if (!isNaN(parsedEntityId)) {
        conditions.push(eq(assignments.entityId, parsedEntityId));
      }
    }

    if (stakeholderId) {
      const parsedStakeholderId = parseInt(stakeholderId);
      if (!isNaN(parsedStakeholderId)) {
        conditions.push(eq(assignments.stakeholderId, parsedStakeholderId));
      }
    }

    if (status) {
      conditions.push(eq(assignments.status, status));
    }

    if (roleType) {
      conditions.push(eq(assignments.roleType, roleType));
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
    const { entityId, stakeholderId, roleType, dueDate } = body;

    // Validate required fields
    if (!entityId) {
      return NextResponse.json(
        { error: 'entityId is required', code: 'MISSING_ENTITY_ID' },
        { status: 400 }
      );
    }

    if (!stakeholderId) {
      return NextResponse.json(
        { error: 'stakeholderId is required', code: 'MISSING_STAKEHOLDER_ID' },
        { status: 400 }
      );
    }

    if (!roleType) {
      return NextResponse.json(
        { error: 'roleType is required', code: 'MISSING_ROLE_TYPE' },
        { status: 400 }
      );
    }

    if (!dueDate) {
      return NextResponse.json(
        { error: 'dueDate is required', code: 'MISSING_DUE_DATE' },
        { status: 400 }
      );
    }

    // Validate roleType
    if (!VALID_ROLE_TYPES.includes(roleType)) {
      return NextResponse.json(
        {
          error: `roleType must be one of: ${VALID_ROLE_TYPES.join(', ')}`,
          code: 'INVALID_ROLE_TYPE',
        },
        { status: 400 }
      );
    }

    // Validate entityId and stakeholderId are numbers
    const parsedEntityId = parseInt(entityId);
    const parsedStakeholderId = parseInt(stakeholderId);

    if (isNaN(parsedEntityId)) {
      return NextResponse.json(
        { error: 'entityId must be a valid number', code: 'INVALID_ENTITY_ID' },
        { status: 400 }
      );
    }

    if (isNaN(parsedStakeholderId)) {
      return NextResponse.json(
        { error: 'stakeholderId must be a valid number', code: 'INVALID_STAKEHOLDER_ID' },
        { status: 400 }
      );
    }

    // Create new assignment
    const newAssignment = await db
      .insert(assignments)
      .values({
        entityId: parsedEntityId,
        stakeholderId: parsedStakeholderId,
        roleType,
        dueDate,
        status: 'pending',
        assignedAt: new Date().toISOString(),
        completedAt: null,
      })
      .returning();

    return NextResponse.json(newAssignment[0], { status: 201 });
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

    const assignmentId = parseInt(id);

    // Check if assignment exists
    const existingAssignment = await db
      .select()
      .from(assignments)
      .where(eq(assignments.id, assignmentId))
      .limit(1);

    if (existingAssignment.length === 0) {
      return NextResponse.json(
        { error: 'Assignment not found', code: 'ASSIGNMENT_NOT_FOUND' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { status, dueDate, completedAt } = body;

    // Build update object
    const updates: any = {};

    if (status !== undefined) {
      // Validate status
      if (!VALID_STATUSES.includes(status)) {
        return NextResponse.json(
          {
            error: `status must be one of: ${VALID_STATUSES.join(', ')}`,
            code: 'INVALID_STATUS',
          },
          { status: 400 }
        );
      }
      updates.status = status;

      // Auto-update completedAt if status changes to 'completed'
      if (status === 'completed' && !existingAssignment[0].completedAt) {
        updates.completedAt = new Date().toISOString();
      }
    }

    if (dueDate !== undefined) {
      updates.dueDate = dueDate;
    }

    if (completedAt !== undefined) {
      updates.completedAt = completedAt;
    }

    // Check if there are any updates
    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update', code: 'NO_UPDATES' },
        { status: 400 }
      );
    }

    const updatedAssignment = await db
      .update(assignments)
      .set(updates)
      .where(eq(assignments.id, assignmentId))
      .returning();

    return NextResponse.json(updatedAssignment[0], { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}