import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { getAssetGroups, createAssetGroup } from '@/lib/db/queries-groups';
import { z } from 'zod';

// GET /api/assets/groups - List groups
export async function GET(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user?.teamId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const groups = await getAssetGroups(user.teamId);

    return NextResponse.json(groups);
  } catch (error) {
    console.error('Error fetching asset groups:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/assets/groups - Create group
export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user?.teamId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    const groupSchema = z.object({
      name: z.string().min(1).max(100),
      description: z.string().optional().nullable(),
      type: z.enum(['logical', 'location', 'department', 'compliance', 'custom', 'dynamic']).default('custom'),
      parentGroupId: z.number().optional().nullable(),
      icon: z.string().optional().nullable(),
      color: z.string().optional().nullable(),
      sortOrder: z.number().default(0),
      isDynamic: z.boolean().default(false),
      rules: z.record(z.any()).optional().nullable()
    });

    const validatedData = groupSchema.parse(body);

    const group = await createAssetGroup({
      ...validatedData,
      organizationId: user.teamId
    });

    return NextResponse.json(group, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error creating asset group:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}