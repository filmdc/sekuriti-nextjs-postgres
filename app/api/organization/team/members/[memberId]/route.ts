import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { teamMembers, activityLogs } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { getUser } from '@/lib/db/queries';
import { ActivityType } from '@/lib/db/schema';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { memberId: string } }
) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const memberId = parseInt(params.memberId);

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

    // Check if user has permission to remove members (admin or owner)
    if (!['admin', 'owner'].includes(userRole)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Get the member to be removed
    const [memberToRemove] = await db
      .select()
      .from(teamMembers)
      .where(
        and(
          eq(teamMembers.id, memberId),
          eq(teamMembers.teamId, organizationId)
        )
      );

    if (!memberToRemove) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    // Prevent removing the owner
    if (memberToRemove.role === 'owner') {
      return NextResponse.json({ error: 'Cannot remove organization owner' }, { status: 400 });
    }

    // Remove the member
    await db.delete(teamMembers).where(eq(teamMembers.id, memberId));

    // Log the activity
    await db.insert(activityLogs).values({
      teamId: organizationId,
      userId: user.id,
      action: ActivityType.REMOVE_TEAM_MEMBER,
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || ''
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing team member:', error);
    return NextResponse.json(
      { error: 'Failed to remove team member' },
      { status: 500 }
    );
  }
}