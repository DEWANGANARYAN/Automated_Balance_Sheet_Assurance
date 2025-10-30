import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { glAccounts } from '@/db/schema';
import { eq, like, and, or, desc } from 'drizzle-orm';

const VALID_ACCOUNT_TYPES = ['Asset', 'Liability', 'Equity', 'Revenue', 'Expense'];

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    // Single record fetch
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const account = await db
        .select()
        .from(glAccounts)
        .where(eq(glAccounts.id, parseInt(id)))
        .limit(1);

      if (account.length === 0) {
        return NextResponse.json(
          { error: 'GL account not found', code: 'NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(account[0], { status: 200 });
    }

    // List query - entityId is REQUIRED
    const entityId = searchParams.get('entityId');
    if (!entityId) {
      return NextResponse.json(
        { error: 'entityId is required for list queries', code: 'MISSING_ENTITY_ID' },
        { status: 400 }
      );
    }

    if (isNaN(parseInt(entityId))) {
      return NextResponse.json(
        { error: 'Valid entityId is required', code: 'INVALID_ENTITY_ID' },
        { status: 400 }
      );
    }

    // Pagination
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    
    // Filters
    const accountType = searchParams.get('accountType');
    const search = searchParams.get('search');

    let query = db.select().from(glAccounts);

    // Build where conditions
    const conditions = [eq(glAccounts.entityId, parseInt(entityId))];

    if (accountType) {
      if (!VALID_ACCOUNT_TYPES.includes(accountType)) {
        return NextResponse.json(
          { 
            error: `Invalid account type. Must be one of: ${VALID_ACCOUNT_TYPES.join(', ')}`,
            code: 'INVALID_ACCOUNT_TYPE' 
          },
          { status: 400 }
        );
      }
      conditions.push(eq(glAccounts.accountType, accountType));
    }

    if (search) {
      const searchCondition = or(
        like(glAccounts.accountNumber, `%${search}%`),
        like(glAccounts.accountName, `%${search}%`)
      );
      conditions.push(searchCondition);
    }

    query = query.where(and(...conditions));
    
    const results = await query
      .orderBy(desc(glAccounts.lastUpdated))
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
    const { entityId, accountNumber, accountName, accountType, currentBalance, previousBalance, openingBalance, currency } = body;

    // Validate required fields
    if (!entityId) {
      return NextResponse.json(
        { error: 'entityId is required', code: 'MISSING_ENTITY_ID' },
        { status: 400 }
      );
    }

    if (!accountNumber) {
      return NextResponse.json(
        { error: 'accountNumber is required', code: 'MISSING_ACCOUNT_NUMBER' },
        { status: 400 }
      );
    }

    if (!accountName) {
      return NextResponse.json(
        { error: 'accountName is required', code: 'MISSING_ACCOUNT_NAME' },
        { status: 400 }
      );
    }

    if (!accountType) {
      return NextResponse.json(
        { error: 'accountType is required', code: 'MISSING_ACCOUNT_TYPE' },
        { status: 400 }
      );
    }

    // Validate account type
    if (!VALID_ACCOUNT_TYPES.includes(accountType)) {
      return NextResponse.json(
        { 
          error: `Invalid account type. Must be one of: ${VALID_ACCOUNT_TYPES.join(', ')}`,
          code: 'INVALID_ACCOUNT_TYPE' 
        },
        { status: 400 }
      );
    }

    // Validate entityId is a number
    if (isNaN(parseInt(entityId))) {
      return NextResponse.json(
        { error: 'entityId must be a valid number', code: 'INVALID_ENTITY_ID' },
        { status: 400 }
      );
    }

    // Prepare insert data with defaults
    const insertData = {
      entityId: parseInt(entityId),
      accountNumber: accountNumber.trim(),
      accountName: accountName.trim(),
      accountType,
      currentBalance: currentBalance !== undefined ? parseFloat(currentBalance) : 0,
      previousBalance: previousBalance !== undefined ? parseFloat(previousBalance) : 0,
      openingBalance: openingBalance !== undefined ? parseFloat(openingBalance) : 0,
      currency: currency?.trim() || 'USD',
      lastUpdated: new Date().toISOString(),
    };

    const newAccount = await db
      .insert(glAccounts)
      .values(insertData)
      .returning();

    return NextResponse.json(newAccount[0], { status: 201 });
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
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Check if record exists
    const existing = await db
      .select()
      .from(glAccounts)
      .where(eq(glAccounts.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'GL account not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { accountName, accountType, currentBalance, previousBalance, openingBalance, currency } = body;

    // Validate account type if provided
    if (accountType && !VALID_ACCOUNT_TYPES.includes(accountType)) {
      return NextResponse.json(
        { 
          error: `Invalid account type. Must be one of: ${VALID_ACCOUNT_TYPES.join(', ')}`,
          code: 'INVALID_ACCOUNT_TYPE' 
        },
        { status: 400 }
      );
    }

    // Prepare update data
    const updateData: any = {
      lastUpdated: new Date().toISOString(),
    };

    if (accountName !== undefined) {
      updateData.accountName = accountName.trim();
    }

    if (accountType !== undefined) {
      updateData.accountType = accountType;
    }

    if (currentBalance !== undefined) {
      updateData.currentBalance = parseFloat(currentBalance);
    }

    if (previousBalance !== undefined) {
      updateData.previousBalance = parseFloat(previousBalance);
    }

    if (openingBalance !== undefined) {
      updateData.openingBalance = parseFloat(openingBalance);
    }

    if (currency !== undefined) {
      updateData.currency = currency.trim();
    }

    const updated = await db
      .update(glAccounts)
      .set(updateData)
      .where(eq(glAccounts.id, parseInt(id)))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json(
        { error: 'GL account not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

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
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Check if record exists
    const existing = await db
      .select()
      .from(glAccounts)
      .where(eq(glAccounts.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'GL account not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const deleted = await db
      .delete(glAccounts)
      .where(eq(glAccounts.id, parseInt(id)))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json(
        { error: 'GL account not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { 
        message: 'GL account deleted successfully',
        deletedAccount: deleted[0] 
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