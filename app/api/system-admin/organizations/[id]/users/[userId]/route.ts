import { NextRequest, NextResponse } from 'next/server';
import { withSystemAdmin, logSystemAction } from '@/lib/auth/system-admin';
import { db } from '@/lib/db/drizzle';
import { teamMembers, ActivityType } from '@/lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';

// DELETE /api/system-admin/organizations/[id]/users/[userId] - Remove user from organization
export const DELETE = withSystemAdmin(async (
  req: NextRequest,
  context: { params: { id: string, userId: string }, user: any }
) => {
  try {
    const orgId = parseInt(context.params.id);
    const userId = parseInt(context.params.userId);

    // Delete the team membership
    await db
      .delete(teamMembers)
      .where(
        and(
          eq(teamMembers.userId, userId),
          eq(teamMembers.teamId, orgId)
        )
      );

    // Update organization user count
    await db.execute(sql`
      UPDATE organization_limits
      SET current_users = (
        SELECT COUNT(DISTINCT user_id)
        FROM team_members
        WHERE team_id = ${orgId}
      )
      WHERE organization_id = ${orgId}
    `);

    // Log the action
    await logSystemAction({
      userId: context.user.id,
      action: ActivityType.REMOVE_USER,
      entityType: 'user',
      entityId: userId,
      organizationId: orgId,
    });

    return NextResponse.json({
      success: true,
      message: 'User removed successfully',
    });
  } catch (error) {
    console.error('Error removing user from organization:', error);
    return NextResponse.json(
      { error: 'Failed to remove user from organization' },
      { status: 500 }
    );
  }
});