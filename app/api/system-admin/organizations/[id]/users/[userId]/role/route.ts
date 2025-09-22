import { NextRequest, NextResponse } from 'next/server';
import { withSystemAdmin, logSystemAction } from '@/lib/auth/system-admin';
import { db } from '@/lib/db/drizzle';
import { teamMembers, users, ActivityType } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

// PUT /api/system-admin/organizations/[id]/users/[userId]/role - Update user role
export const PUT = withSystemAdmin(async (
  req: NextRequest,
  context: { params: { id: string, userId: string }, user: any }
) => {
  try {
    const orgId = parseInt(context.params.id);
    const userId = parseInt(context.params.userId);
    const { role } = await req.json();

    if (!role || !['owner', 'admin', 'member'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      );
    }

    // Update the role in team members
    await db
      .update(teamMembers)
      .set({ role })
      .where(
        and(
          eq(teamMembers.userId, userId),
          eq(teamMembers.teamId, orgId)
        )
      );

    // Update organization admin flag if needed
    await db
      .update(users)
      .set({
        isOrganizationAdmin: role === 'owner' || role === 'admin'
      })
      .where(eq(users.id, userId));

    // Log the action
    await logSystemAction({
      userId: context.user.id,
      action: ActivityType.UPDATE_ROLE,
      entityType: 'user',
      entityId: userId,
      organizationId: orgId,
      metadata: { role },
    });

    return NextResponse.json({
      success: true,
      message: 'User role updated successfully',
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    return NextResponse.json(
      { error: 'Failed to update user role' },
      { status: 500 }
    );
  }
});