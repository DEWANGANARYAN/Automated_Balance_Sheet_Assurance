import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { stakeholders } from '@/db/schema';
import { eq, like, and, or } from 'drizzle-orm';

const VALID_ROLES = ['maker', 'checker', 'approver', 'admin'];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Single stakeholder fetch
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const stakeholder = await db
        .select()
        .from(stakeholders)
        .where(eq(stakeholders.id, parseInt(id)))
        .limit(1);

      if (stakeholder.length === 0) {
        return NextResponse.json(
          { error: 'Stakeholder not found', code: 'NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(stakeholder[0], { status: 200 });
    }

    // List stakeholders with filtering
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const search = searchParams.get('search');
    const role = searchParams.get('role');
    const department = searchParams.get('department');

    let query = db.select().from(stakeholders);

    // Build filter conditions
    const conditions = [];

    if (search) {
      conditions.push(
        or(
          like(stakeholders.name, `%${search}%`),
          like(stakeholders.email, `%${search}%`)
        )
      );
    }

    if (role) {
      conditions.push(eq(stakeholders.role, role));
    }

    if (department) {
      conditions.push(eq(stakeholders.department, department));
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
    const { name, email, role, department, entities, notificationPreferences } = body;

    // Validate required fields
    if (!name || !email || !role || !department) {
      return NextResponse.json(
        {
          error: 'Missing required fields: name, email, role, and department are required',
          code: 'MISSING_REQUIRED_FIELDS',
        },
        { status: 400 }
      );
    }

    // Validate role
    if (!VALID_ROLES.includes(role)) {
      return NextResponse.json(
        {
          error: `Invalid role. Must be one of: ${VALID_ROLES.join(', ')}`,
          code: 'INVALID_ROLE',
        },
        { status: 400 }
      );
    }

    // Sanitize inputs
    const sanitizedName = name.trim();
    const sanitizedEmail = email.trim().toLowerCase();
    const sanitizedDepartment = department.trim();

    if (!sanitizedName || !sanitizedEmail || !sanitizedDepartment) {
      return NextResponse.json(
        {
          error: 'Name, email, and department cannot be empty after trimming',
          code: 'INVALID_INPUT',
        },
        { status: 400 }
      );
    }

    // Check for duplicate email
    const existingStakeholder = await db
      .select()
      .from(stakeholders)
      .where(eq(stakeholders.email, sanitizedEmail))
      .limit(1);

    if (existingStakeholder.length > 0) {
      return NextResponse.json(
        {
          error: 'Email already exists',
          code: 'DUPLICATE_EMAIL',
        },
        { status: 400 }
      );
    }

    // Prepare insert data
    const insertData = {
      name: sanitizedName,
      email: sanitizedEmail,
      role,
      department: sanitizedDepartment,
      entities: entities || [],
      notificationPreferences: notificationPreferences || { email: true, inApp: true },
      createdAt: new Date().toISOString(),
    };

    const newStakeholder = await db
      .insert(stakeholders)
      .values(insertData)
      .returning();

    return NextResponse.json(newStakeholder[0], { status: 201 });
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

    // Check if stakeholder exists
    const existingStakeholder = await db
      .select()
      .from(stakeholders)
      .where(eq(stakeholders.id, parseInt(id)))
      .limit(1);

    if (existingStakeholder.length === 0) {
      return NextResponse.json(
        { error: 'Stakeholder not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { name, email, role, department, entities, notificationPreferences } = body;

    // Validate role if provided
    if (role && !VALID_ROLES.includes(role)) {
      return NextResponse.json(
        {
          error: `Invalid role. Must be one of: ${VALID_ROLES.join(', ')}`,
          code: 'INVALID_ROLE',
        },
        { status: 400 }
      );
    }

    // If email is being updated, check for duplicates
    if (email && email.trim().toLowerCase() !== existingStakeholder[0].email) {
      const duplicateCheck = await db
        .select()
        .from(stakeholders)
        .where(eq(stakeholders.email, email.trim().toLowerCase()))
        .limit(1);

      if (duplicateCheck.length > 0) {
        return NextResponse.json(
          {
            error: 'Email already exists',
            code: 'DUPLICATE_EMAIL',
          },
          { status: 400 }
        );
      }
    }

    // Build update object with only provided fields
    const updates: any = {};

    if (name !== undefined) {
      const sanitizedName = name.trim();
      if (!sanitizedName) {
        return NextResponse.json(
          { error: 'Name cannot be empty', code: 'INVALID_INPUT' },
          { status: 400 }
        );
      }
      updates.name = sanitizedName;
    }

    if (email !== undefined) {
      const sanitizedEmail = email.trim().toLowerCase();
      if (!sanitizedEmail) {
        return NextResponse.json(
          { error: 'Email cannot be empty', code: 'INVALID_INPUT' },
          { status: 400 }
        );
      }
      updates.email = sanitizedEmail;
    }

    if (role !== undefined) {
      updates.role = role;
    }

    if (department !== undefined) {
      const sanitizedDepartment = department.trim();
      if (!sanitizedDepartment) {
        return NextResponse.json(
          { error: 'Department cannot be empty', code: 'INVALID_INPUT' },
          { status: 400 }
        );
      }
      updates.department = sanitizedDepartment;
    }

    if (entities !== undefined) {
      updates.entities = entities;
    }

    if (notificationPreferences !== undefined) {
      updates.notificationPreferences = notificationPreferences;
    }

    // Perform update
    const updatedStakeholder = await db
      .update(stakeholders)
      .set(updates)
      .where(eq(stakeholders.id, parseInt(id)))
      .returning();

    return NextResponse.json(updatedStakeholder[0], { status: 200 });
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

    // Check if stakeholder exists
    const existingStakeholder = await db
      .select()
      .from(stakeholders)
      .where(eq(stakeholders.id, parseInt(id)))
      .limit(1);

    if (existingStakeholder.length === 0) {
      return NextResponse.json(
        { error: 'Stakeholder not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const deleted = await db
      .delete(stakeholders)
      .where(eq(stakeholders.id, parseInt(id)))
      .returning();

    return NextResponse.json(
      {
        message: 'Stakeholder deleted successfully',
        stakeholder: deleted[0],
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