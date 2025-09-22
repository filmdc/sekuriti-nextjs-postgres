import { NextRequest, NextResponse } from 'next/server';
import { withSystemAdmin, logSystemAction } from '@/lib/auth/system-admin';
import { db } from '@/lib/db/drizzle';
import { teams, ActivityType } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// PUT /api/system-admin/organizations/[id]/status - Update organization status
export const PUT = withSystemAdmin(async (
  req: NextRequest,
  context: { params: { id: string }, user: any }
) => {
  try {
    const orgId = parseInt(context.params.id);
    const { status } = await req.json();

    // Validate status
    const validStatuses = ['active', 'suspended', 'trial', 'expired'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    // Get current organization
    const [currentOrg] = await db
      .select()
      .from(teams)
      .where(eq(teams.id, orgId))
      .limit(1);

    if (!currentOrg) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      );
    }

    // Update status
    const [updatedOrg] = await db
      .update(teams)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(teams.id, orgId))
      .returning();

    // Log the action
    const actionType = status === 'suspended'
      ? ActivityType.SUSPEND_ORGANIZATION
      : ActivityType.UPDATE_ORGANIZATION;

    await logSystemAction({
      userId: context.user.id,
      action: actionType,
      entityType: 'organization',
      entityId: orgId,
      organizationId: orgId,
      changes: {
        before: { status: currentOrg.status },
        after: { status },
      },
      metadata: {
        organizationName: currentOrg.name,
        previousStatus: currentOrg.status,
        newStatus: status,
      },
    });

    return NextResponse.json({
      success: true,
      organization: updatedOrg,
      message: `Organization status changed to ${status}`,
    });
  } catch (error) {
    console.error('Error updating organization status:', error);
    return NextResponse.json(
      { error: 'Failed to update organization status' },
      { status: 500 }
    );
  }
});