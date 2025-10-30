import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { entities } from '@/db/schema';
import { eq, like, and, or, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Single entity by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const entity = await db
        .select()
        .from(entities)
        .where(eq(entities.id, parseInt(id)))
        .limit(1);

      if (entity.length === 0) {
        return NextResponse.json(
          { error: 'Entity not found', code: 'ENTITY_NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(entity[0], { status: 200 });
    }

    // List entities with filters, search, and pagination
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const search = searchParams.get('search');
    const department = searchParams.get('department');
    const region = searchParams.get('region');
    const status = searchParams.get('status');

    let query = db.select().from(entities);

    // Build filter conditions
    const conditions = [];

    if (search) {
      conditions.push(
        or(
          like(entities.name, `%${search}%`),
          like(entities.code, `%${search}%`)
        )
      );
    }

    if (department) {
      conditions.push(eq(entities.department, department));
    }

    if (region) {
      conditions.push(eq(entities.region, region));
    }

    if (status) {
      conditions.push(eq(entities.status, status));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query
      .orderBy(desc(entities.createdAt))
      .limit(limit)
      .offset(offset);

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
    const { name, code, department, region, status } = body;

    // Validate required fields
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Name is required and must be a non-empty string', code: 'MISSING_NAME' },
        { status: 400 }
      );
    }

    if (!code || typeof code !== 'string' || code.trim().length === 0) {
      return NextResponse.json(
        { error: 'Code is required and must be a non-empty string', code: 'MISSING_CODE' },
        { status: 400 }
      );
    }

    if (!department || typeof department !== 'string' || department.trim().length === 0) {
      return NextResponse.json(
        { error: 'Department is required and must be a non-empty string', code: 'MISSING_DEPARTMENT' },
        { status: 400 }
      );
    }

    if (!region || typeof region !== 'string' || region.trim().length === 0) {
      return NextResponse.json(
        { error: 'Region is required and must be a non-empty string', code: 'MISSING_REGION' },
        { status: 400 }
      );
    }

    // Sanitize inputs
    const trimmedName = name.trim();
    const trimmedCode = code.trim();
    const trimmedDepartment = department.trim();
    const trimmedRegion = region.trim();
    const entityStatus = status?.trim() || 'active';

    // Check for duplicate code
    const existingEntity = await db
      .select()
      .from(entities)
      .where(eq(entities.code, trimmedCode))
      .limit(1);

    if (existingEntity.length > 0) {
      return NextResponse.json(
        { error: 'Entity with this code already exists', code: 'DUPLICATE_CODE' },
        { status: 400 }
      );
    }

    // Create new entity
    const now = new Date().toISOString();
    const newEntity = await db
      .insert(entities)
      .values({
        name: trimmedName,
        code: trimmedCode,
        department: trimmedDepartment,
        region: trimmedRegion,
        status: entityStatus,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    return NextResponse.json(newEntity[0], { status: 201 });
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
    const { name, code, department, region, status } = body;

    // Check if entity exists
    const existingEntity = await db
      .select()
      .from(entities)
      .where(eq(entities.id, parseInt(id)))
      .limit(1);

    if (existingEntity.length === 0) {
      return NextResponse.json(
        { error: 'Entity not found', code: 'ENTITY_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Build update object with only provided fields
    const updates: any = {
      updatedAt: new Date().toISOString(),
    };

    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length === 0) {
        return NextResponse.json(
          { error: 'Name must be a non-empty string', code: 'INVALID_NAME' },
          { status: 400 }
        );
      }
      updates.name = name.trim();
    }

    if (code !== undefined) {
      if (typeof code !== 'string' || code.trim().length === 0) {
        return NextResponse.json(
          { error: 'Code must be a non-empty string', code: 'INVALID_CODE' },
          { status: 400 }
        );
      }

      const trimmedCode = code.trim();

      // Check for duplicate code (excluding current entity)
      const duplicateCode = await db
        .select()
        .from(entities)
        .where(eq(entities.code, trimmedCode))
        .limit(1);

      if (duplicateCode.length > 0 && duplicateCode[0].id !== parseInt(id)) {
        return NextResponse.json(
          { error: 'Entity with this code already exists', code: 'DUPLICATE_CODE' },
          { status: 400 }
        );
      }

      updates.code = trimmedCode;
    }

    if (department !== undefined) {
      if (typeof department !== 'string' || department.trim().length === 0) {
        return NextResponse.json(
          { error: 'Department must be a non-empty string', code: 'INVALID_DEPARTMENT' },
          { status: 400 }
        );
      }
      updates.department = department.trim();
    }

    if (region !== undefined) {
      if (typeof region !== 'string' || region.trim().length === 0) {
        return NextResponse.json(
          { error: 'Region must be a non-empty string', code: 'INVALID_REGION' },
          { status: 400 }
        );
      }
      updates.region = region.trim();
    }

    if (status !== undefined) {
      if (typeof status !== 'string' || status.trim().length === 0) {
        return NextResponse.json(
          { error: 'Status must be a non-empty string', code: 'INVALID_STATUS' },
          { status: 400 }
        );
      }
      updates.status = status.trim();
    }

    // Update entity
    const updatedEntity = await db
      .update(entities)
      .set(updates)
      .where(eq(entities.id, parseInt(id)))
      .returning();

    return NextResponse.json(updatedEntity[0], { status: 200 });
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

    // Check if entity exists
    const existingEntity = await db
      .select()
      .from(entities)
      .where(eq(entities.id, parseInt(id)))
      .limit(1);

    if (existingEntity.length === 0) {
      return NextResponse.json(
        { error: 'Entity not found', code: 'ENTITY_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Delete entity
    const deletedEntity = await db
      .delete(entities)
      .where(eq(entities.id, parseInt(id)))
      .returning();

    return NextResponse.json(
      {
        message: 'Entity deleted successfully',
        entity: deletedEntity[0],
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