import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { teamMembers } from '@/lib/db/schema';
import { tagPolicies } from '@/lib/db/schema-tags';
import { eq } from 'drizzle-orm';
import { getUser } from '@/lib/db/queries';

export async function GET(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's organization
    const memberRecord = await db
      .select()
      .from(teamMembers)
      .where(eq(teamMembers.userId, user.id))
      .limit(1);

    if (!memberRecord.length) {
      return NextResponse.json({ error: 'No organization found' }, { status: 404 });
    }

    const organizationId = memberRecord[0].teamId;

    // Fetch tag policies
    const policies = await db
      .select()
      .from(tagPolicies)
      .where(eq(tagPolicies.organizationId, organizationId));

    return NextResponse.json(policies);
  } catch (error) {
    console.error('Error fetching tag policies:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tag policies' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Get user's organization and verify they have permission
    const memberRecord = await db
      .select()
      .from(teamMembers)
      .where(eq(teamMembers.userId, user.id))
      .limit(1);

    if (!memberRecord.length) {
      return NextResponse.json({ error: 'No organization found' }, { status: 404 });
    }

    const organizationId = memberRecord[0].teamId;
    const userRole = memberRecord[0].role;

    // Check if user has permission (admin or owner)
    if (!['admin', 'owner'].includes(userRole)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Create tag policy
    const [newPolicy] = await db
      .insert(tagPolicies)
      .values({
        organizationId,
        entityType: body.entityType,
        requiredTags: body.requiredTags,
        autoTags: body.autoTags || null,
        isActive: body.isActive !== undefined ? body.isActive : true
      })
      .returning();

    return NextResponse.json(newPolicy);
  } catch (error) {
    console.error('Error creating tag policy:', error);
    return NextResponse.json(
      { error: 'Failed to create tag policy' },
      { status: 500 }
    );
  }
}